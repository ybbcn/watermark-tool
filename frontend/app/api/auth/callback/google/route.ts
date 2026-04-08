import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { upsertUser } from "@/lib/db";

export const runtime = "edge";

export async function GET(request: NextRequest, { env }: { env: { DB: D1Database } }) {
  try {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const AUTH_SECRET = process.env.AUTH_SECRET;

    console.log("🔐 [Callback] Starting OAuth callback...");
    console.log("🔐 [Callback] GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID ? "✅ present" : "❌ missing");
    console.log("🔐 [Callback] GOOGLE_CLIENT_SECRET:", GOOGLE_CLIENT_SECRET ? "✅ present" : "❌ missing");
    console.log("🔐 [Callback] AUTH_SECRET:", AUTH_SECRET ? "✅ present" : "❌ missing");

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !AUTH_SECRET) {
      console.error("❌ [Callback] Missing environment variables");
      return NextResponse.redirect(new URL("/?error=missing_env", request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("❌ [Callback] OAuth error:", error);
      return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
    }

    if (!code) {
      console.error("❌ [Callback] No code received");
      return NextResponse.redirect(new URL("/?error=no_code", request.url));
    }

    console.log("🔐 [Callback] Code received, exchanging token...");

    // 使用固定的 redirect URI（必须与 Google Cloud Console 中配置的一致）
    const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    
    // 优先使用配置的 redirect URI，如果没有则动态生成
    const redirectUri = GOOGLE_REDIRECT_URI || `${protocol}://${host}/api/auth/callback/google`;
    
    console.log("🔐 [Callback] Using redirect URI:", redirectUri);
    
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("❌ [Callback] Token exchange failed:", errorData);
      return NextResponse.redirect(new URL("/?error=token_failed", request.url));
    }

    const tokenData = await tokenResponse.json();
    console.log("🔐 [Callback] Token exchanged successfully");
    
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoResponse.ok) {
      console.error("❌ [Callback] Failed to fetch user info");
      return NextResponse.redirect(new URL("/?error=user_info_failed", request.url));
    }

    const userInfo = await userInfoResponse.json();
    console.log("🔐 [Callback] User info fetched:", userInfo.email);
    
    // 创建或更新用户
    try {
      await upsertUser(env.DB, {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      });
      console.log("🔐 [Callback] User upserted to DB");
    } catch (dbErr) {
      console.error("❌ [Callback] DB upsert failed:", dbErr);
      // DB 失败不影响登录，继续
    }
    
    // 创建会话 Token
    const token = await createSession({
      id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    });

    console.log("🔐 [Callback] Session token created");

    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    
    console.log("🔐 [Callback] Session cookie set, redirecting to home");
    
    return response;
  } catch (err) {
    console.error("❌ [Callback] Unexpected error:", err);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
