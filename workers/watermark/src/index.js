/**
 * Watermark Tool - Cloudflare Workers Backend
 * Google OAuth + D1 数据库完整实现
 */

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const SCOPES = ['openid', 'email', 'profile'];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Credentials': 'true'
        }
      });
    }

    try {
      // ========== OAuth 路由 ==========

      // 1. 发起 Google 登录
      if (path === '/auth/google' && request.method === 'GET') {
        const state = generateId();
        const codeVerifier = generateCodeVerifier();
        
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        
        const params = new URLSearchParams({
          client_id: env.GOOGLE_CLIENT_ID,
          redirect_uri: env.REDIRECT_URI,
          response_type: 'code',
          scope: SCOPES.join(' '),
          state,
          code_challenge: codeChallenge,
          code_challenge_method: 'S256'
        });
        
        const response = new Response(null, {
          status: 302,
          headers: {
            'Location': `${GOOGLE_AUTH_URL}?${params.toString()}`,
            'Set-Cookie': `oauth_code_verifier=${codeVerifier}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`
          }
        });
        return response;
      }

      // 2. Google 回调
      if (path === '/auth/google/callback' && request.method === 'GET') {
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');
        
        if (error) {
          return new Response(JSON.stringify({ error: 'OAuth error: ' + error }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        if (!code) {
          return new Response(JSON.stringify({ error: 'No code provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 获取 code_verifier
        const cookieHeader = request.headers.get('Cookie') || '';
        const codeVerifier = getCookie(cookieHeader, 'oauth_code_verifier');
        
        if (!codeVerifier) {
          return new Response(JSON.stringify({ error: 'Missing code verifier' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 交换 token
        const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: env.REDIRECT_URI,
            code_verifier: codeVerifier
          })
        });
        
        if (!tokenResponse.ok) {
          const err = await tokenResponse.text();
          return new Response(JSON.stringify({ error: 'Token exchange failed', detail: err }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const tokens = await tokenResponse.json();
        
        // 获取用户信息
        const userResponse = await fetch(GOOGLE_USERINFO_URL, {
          headers: { 'Authorization': `Bearer ${tokens.access_token}` }
        });
        const googleUser = await userResponse.json();
        
        const now = Date.now();
        const userId = googleUser.id;
        
        // 查询或创建用户
        let user = await env.DB
          .prepare('SELECT * FROM users WHERE id = ?')
          .bind(userId)
          .first();
        
        if (!user) {
          // 创建新用户
          await env.DB
            .prepare(`INSERT INTO users (id, email, name, picture, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`)
            .bind(userId, googleUser.email, googleUser.name || '', googleUser.picture || '', now, now)
            .run();
        } else {
          // 更新用户信息
          await env.DB
            .prepare(`UPDATE users SET name = ?, picture = ?, updated_at = ? WHERE id = ?`)
            .bind(googleUser.name || '', googleUser.picture || '', now, userId)
            .run();
        }
        
        // 创建或更新 account
        const existingAccount = await env.DB
          .prepare('SELECT * FROM accounts WHERE user_id = ? AND provider = ?')
          .bind(userId, 'google')
          .first();
        
        if (existingAccount) {
          await env.DB
            .prepare(`UPDATE accounts SET access_token = ?, refresh_token = ?, expires_at = ? WHERE id = ?`)
            .bind(tokens.access_token, tokens.refresh_token || '', tokens.expires_in ? now + tokens.expires_in * 1000 : 0, existingAccount.id)
            .run();
        } else {
          await env.DB
            .prepare(`INSERT INTO accounts (id, user_id, provider, provider_id, access_token, refresh_token, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
            .bind(generateId(), userId, 'google', googleUser.id, tokens.access_token, tokens.refresh_token || '', tokens.expires_in ? now + tokens.expires_in * 1000 : 0, now)
            .run();
        }
        
        // 创建 session
        const sessionToken = generateId() + generateId();
        const sessionExpiry = now + 30 * 24 * 60 * 60 * 1000; // 30 天
        
        await env.DB
          .prepare(`INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`)
          .bind(generateId(), userId, sessionToken, sessionExpiry, now)
          .run();
        
        // 重定向到前端，并设置 session cookie
        const response = new Response(null, {
          status: 302,
          headers: {
            'Location': '/?auth=success',
            'Set-Cookie': `session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${30 * 24 * 60 * 60}`
          }
        });
        return response;
      }

      // 3. 获取当前用户
      if (path === '/auth/user' && request.method === 'GET') {
        const sessionToken = getCookie(request.headers.get('Cookie') || '', 'session');
        
        if (!sessionToken) {
          return jsonResponse({ authenticated: false }, 200, true);
        }
        
        const session = await env.DB
          .prepare('SELECT * FROM sessions WHERE token = ?')
          .bind(sessionToken)
          .first();
        
        if (!session || session.expires_at < Date.now()) {
          return jsonResponse({ authenticated: false }, 200, true);
        }
        
        const user = await env.DB
          .prepare('SELECT id, email, name, picture FROM users WHERE id = ?')
          .bind(session.user_id)
          .first();
        
        return jsonResponse({ authenticated: true, user }, 200, true);
      }

      // 4. 登出
      if (path === '/auth/logout' && request.method === 'POST') {
        const sessionToken = getCookie(request.headers.get('Cookie') || '', 'session');
        
        if (sessionToken) {
          await env.DB
            .prepare('DELETE FROM sessions WHERE token = ?')
            .bind(sessionToken)
            .run();
        }
        
        return new Response(null, {
          status: 302,
          headers: {
            'Location': '/',
            'Set-Cookie': 'session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
          }
        });
      }

      // ========== 原有 API 路由（保持不变）==========
      
      // 健康检查
      if (path === '/health') {
        return jsonResponse({ status: 'healthy', worker: 'watermark-worker' });
      }

      // 添加文字水印
      if (path === '/api/add-watermark' && request.method === 'POST') {
        return handleWatermark(request);
      }

      // 添加 Logo 水印
      if (path === '/api/add-logo-watermark' && request.method === 'POST') {
        return handleWatermark(request);
      }

      // 移除水印
      if (path === '/api/remove-watermark' && request.method === 'POST') {
        return handleWatermark(request);
      }

      // 首页
      if (path === '/' || path === '') {
        return jsonResponse({
          name: 'Watermark Tool API',
          version: '1.0.0',
          auth: {
            login: 'GET /auth/google',
            logout: 'POST /auth/logout',
            user: 'GET /auth/user'
          },
          endpoints: {
            health: 'GET /health',
            add_watermark: 'POST /api/add-watermark',
            add_logo_watermark: 'POST /api/add-logo-watermark',
            remove_watermark: 'POST /api/remove-watermark'
          }
        });
      }

      return jsonResponse({ error: 'Not found' }, 404);

    } catch (error) {
      return jsonResponse({ error: error.message }, 500);
    }
  }
};

// ========== 辅助函数 ==========

async function handleWatermark(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return jsonResponse({ error: 'Expected multipart/form-data' }, 400);
    }
    
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return jsonResponse({ error: 'No file provided' }, 400);
    }
    
    const imageData = await file.arrayBuffer();
    
    const headers = {
      'Content-Type': 'image/jpeg',
      'Content-Disposition': 'attachment; filename="result.jpg"',
      'Access-Control-Allow-Origin': '*'
    };
    
    return new Response(imageData, { status: 200, headers });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

function jsonResponse(data, status = 200, credentials = false) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': credentials ? 'https://ybbtool.com' : '*',
    'Access-Control-Allow-Credentials': String(credentials)
  };
  return new Response(JSON.stringify(data), { status, headers });
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function getCookie(cookieHeader, name) {
  const match = cookieHeader.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}
