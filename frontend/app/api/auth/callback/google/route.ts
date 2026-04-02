import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

    console.log("🔐 [DEBUG] Callback endpoint called");
    console.log("🔐 [DEBUG] GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID ? "✅" : "❌");
    console.log("🔐 [DEBUG] GOOGLE_CLIENT_SECRET:", GOOGLE_CLIENT_SECRET ? "✅" : "❌");
    console.log("🔐 [DEBUG] NEXTAUTH_SECRET:", NEXTAUTH_SECRET ? "✅" : "❌");

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !NEXTAUTH_SECRET) {
      console.error("❌ Missing environment variables");
      return NextResponse.redirect(new URL("/?error=missing_env", request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("❌ OAuth error:", error);
      return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
    }

    if (!code) {
      console.error("❌ No code received");
      return NextResponse.redirect(new URL("/?error=no_code", request.url));
    }

    console.log("✅ Authorization code received");

    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const redirectUri = `${protocol}://${host}/api/auth/callback/google`;

    console.log("🔗 Redirect URI:", redirectUri);
    console.log("🔄 Exchanging code for token...");
    
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
      console.error("❌ Token exchange failed:", errorData);
      return NextResponse.redirect(new URL("/?error=token_failed", request.url));
    }

    const tokenData = await tokenResponse.json();
    console.log("✅ Token exchange successful");
    
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoResponse.ok) {
      console.error("❌ Failed to fetch user info");
      return NextResponse.redirect(new URL("/?error=user_info_failed", request.url));
    }

    const userInfo = await userInfoResponse.json();
    console.log("✅ User info received:", userInfo.email);
    
    // 简化：使用 JSON Cookie（不使用 JWT 签名）
    const sessionData = {
      user: {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      },
      expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    
    console.log("✅ Session created");
    return response;
  } catch (err) {
    console.error("❌ Callback error:", err);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
