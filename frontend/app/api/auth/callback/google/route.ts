import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Google OAuth 配置 - 从环境变量读取
// 在 Cloudflare Pages Dashboard 中配置：
// - GOOGLE_CLIENT_ID
// - GOOGLE_CLIENT_SECRET  
// - AUTH_SECRET
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const AUTH_SECRET = process.env.AUTH_SECRET;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    // 处理错误
    if (error) {
      console.error("OAuth error from Google:", error);
      return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
    }

    if (!code) {
      console.error("No code received from Google");
      return NextResponse.redirect(new URL("/?error=no_code", request.url));
    }

    // 动态获取当前请求的域名
    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const GOOGLE_REDIRECT_URI = `${protocol}://${host}/api/auth/callback/google`;

    // 验证环境变量
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !AUTH_SECRET) {
      console.error("Missing environment variables");
      return NextResponse.redirect(new URL("/?error=missing_env", request.url));
    }

    // 交换访问令牌
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const values = {
      code,
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    };

    console.log("Exchanging code for token...");
    console.log("Redirect URI:", GOOGLE_REDIRECT_URI);
    
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(values),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(new URL("/?error=token_failed", request.url));
    }

    const tokenData = await tokenResponse.json();
    console.log("Token exchange successful");
    
    // 获取用户信息
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error("Failed to fetch user info");
      return NextResponse.redirect(new URL("/?error=user_info_failed", request.url));
    }

    const userInfo = await userInfoResponse.json();
    console.log("User info received:", userInfo.email);
    
    // 创建简单的 JWT token
    const secret = new TextEncoder().encode(AUTH_SECRET);
    const encoder = new TextEncoder();
    const header = encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = encoder.encode(JSON.stringify({ 
      user: {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      },
      exp: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000)
    }));
    
    function base64UrlEncode(buffer: ArrayBuffer): string {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
    
    const headerBase64 = base64UrlEncode(header.buffer);
    const payloadBase64 = base64UrlEncode(payload.buffer);
    
    // 使用 Web Crypto API 签名
    const key = await crypto.subtle.importKey(
      "raw",
      secret,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`${headerBase64}.${payloadBase64}`));
    const signatureBase64 = base64UrlEncode(signature);
    
    const sessionToken = `${headerBase64}.${payloadBase64}.${signatureBase64}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // 重定向到首页并设置 Cookie
    const response = NextResponse.redirect(new URL("/", request.url));
    response.headers.set("Set-Cookie", `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expiresAt.toUTCString()}`);
    
    console.log("Session created successfully");
    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
