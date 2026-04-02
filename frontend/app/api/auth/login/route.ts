import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    // ✅ 在函数内部读取环境变量
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    
    // 验证环境变量
    if (!GOOGLE_CLIENT_ID) {
      console.error("❌ Missing GOOGLE_CLIENT_ID environment variable");
      console.error("📋 Available env vars:", Object.keys(process.env).join(", "));
      return NextResponse.json(
        { error: "Server configuration error", message: "Missing GOOGLE_CLIENT_ID" },
        { status: 500 }
      );
    }

    console.log("✅ GOOGLE_CLIENT_ID is present");

    // 动态获取当前请求的域名
    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const GOOGLE_REDIRECT_URI = `${protocol}://${host}/api/auth/callback/google`;
    
    console.log("🔗 Redirect URI:", GOOGLE_REDIRECT_URI);
    
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const params = new URLSearchParams({
      redirect_uri: GOOGLE_REDIRECT_URI,
      client_id: GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: "openid email profile",
    });
    
    const url = `${rootUrl}?${params.toString()}`;
    console.log("🔄 Redirecting to Google OAuth");
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      { error: "Login failed", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
