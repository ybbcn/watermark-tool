/**
 * Google OAuth 认证工具 - Cloudflare Pages Edge Runtime 兼容
 */

import { SignJWT, jwtVerify } from "jose";

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface Session {
  user: User;
  expires: number;
}

const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * 获取 AUTH_SECRET（在函数内部读取，确保 Edge Runtime 正确注入）
 * 优先使用 AUTH_SECRET，其次使用 NEXTAUTH_SECRET
 */
function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error("❌ AUTH_SECRET and NEXTAUTH_SECRET are both missing!");
    console.error("Available env vars:", Object.keys(process.env));
    throw new Error("AUTH_SECRET is not configured");
  }
  console.log("✅ Using auth secret, length:", secret.length);
  return secret;
}

/**
 * 生成 Google OAuth 授权 URL
 */
export function getGoogleOAuthURL() {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
  
  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
    console.error("❌ Missing GOOGLE_CLIENT_ID or GOOGLE_REDIRECT_URI");
    throw new Error("OAuth configuration missing");
  }
  
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: GOOGLE_REDIRECT_URI,
    client_id: GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: "openid email profile",
  };

  const qs = new URLSearchParams(options).toString();
  return `${rootUrl}?${qs}`;
}

/**
 * 使用授权码交换访问令牌
 */
export async function exchangeCodeForToken(code: string, redirectUri: string) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("OAuth credentials missing");
  }
  
  const tokenUrl = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  };

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(values),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token exchange failed: ${error.error}`);
  }

  return response.json();
}

/**
 * 获取用户信息
 */
export async function getUserInfo(accessToken: string): Promise<User> {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user info");
  }

  const data = await response.json();
  return {
    id: data.sub,
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}

/**
 * 创建会话 Token
 */
export async function createSession(user: User): Promise<string> {
  const secret = new TextEncoder().encode(getAuthSecret());
  const expiresAt = Date.now() + SESSION_DURATION;

  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(secret);

  return token;
}

/**
 * 验证并解析会话 Token
 */
export async function verifySession(token: string): Promise<Session | null> {
  try {
    const secret = new TextEncoder().encode(getAuthSecret());
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload.user || !payload.exp) {
      return null;
    }

    return {
      user: payload.user as User,
      expires: payload.exp * 1000,
    };
  } catch (err) {
    console.error("❌ verifySession failed:", err);
    return null;
  }
}

/**
 * 创建会话 Cookie
 */
export function createSessionCookie(token: string, expiresAt: Date): string {
  return `session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expiresAt.toUTCString()}`;
}

/**
 * 从 Cookie 中获取 session token
 */
export function getSessionCookie(cookies: string | undefined | null): string | null {
  if (!cookies) return null;
  
  const match = cookies.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * 登出（清除 Cookie）
 */
export function clearSessionCookie(): string {
  return "session=; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
}
