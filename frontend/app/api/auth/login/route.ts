import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
    
    console.log("🔐 [DEBUG] Login endpoint called");
    console.log("🔐 [DEBUG] GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID ? "✅ present" : "❌ missing");
    console.log("🔐 [DEBUG] NEXTAUTH_SECRET:", NEXTAUTH_SECRET ? "✅ present" : "❌ missing");

    if (!GOOGLE_CLIENT_ID) {
      console.error("❌ Missing GOOGLE_CLIENT_ID");
      return NextResponse.json(
        { error: "Server configuration error", message: "Missing GOOGLE_CLIENT_ID" },
        { status: 500 }
      );
    }

    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const redirectUri = `${protocol}://${host}/api/auth/callback/google`;
    
    console.log("🔗 [DEBUG] Redirect URI:", redirectUri);
    
    const params = new URLSearchParams({
      redirect_uri: redirectUri,
      client_id: GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: "openid email profile",
    });
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    console.log("🔄 [DEBUG] Redirecting to:", authUrl);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("❌ [ERROR] Login error:", error);
    return NextResponse.json(
      { error: "Login failed", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
