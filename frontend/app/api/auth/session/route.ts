import { NextRequest, NextResponse } from "next/server";
import { verifySession, getSessionCookie } from "@/lib/auth";
import { getUser, checkAndResetQuota } from "@/lib/db";

export const runtime = "edge";

export async function GET(request: NextRequest, { env }: { env: { DB: D1Database | any } }) {
  const cookies = request.headers.get("cookie");
  const sessionToken = getSessionCookie(cookies);

  console.log("🔐 [Session] Checking session...");
  console.log("🔐 [Session] Cookies present:", cookies ? "yes" : "no");
  console.log("🔐 [Session] Session token found:", sessionToken ? "yes" : "no");

  if (!sessionToken) {
    console.log("🔐 [Session] No session token, returning null user");
    return NextResponse.json({ user: null });
  }

  const session = await verifySession(sessionToken);
  
  console.log("🔐 [Session] Session verification:", session ? "success" : "failed");
  
  if (!session) {
    console.log("🔐 [Session] Invalid session, clearing cookie");
    const response = NextResponse.json({ user: null });
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
    return response;
  }

  // 从数据库获取用户完整信息
  try {
    const user = await checkAndResetQuota(env.DB, session.user.id);
    console.log("🔐 [Session] User fetched from DB:", user?.email || "no user");
    
    return NextResponse.json({ 
      user: {
        ...session.user,
        subscription_type: user?.subscription_type || 'free',
        daily_limit: user?.daily_limit || 3,
        daily_used: user?.daily_used || 0,
        daily_reset_at: user?.daily_reset_at,
      }, 
      expires: session.expires 
    });
  } catch (dbErr) {
    console.error("❌ [Session] DB fetch failed:", dbErr);
    // DB 失败但 session 有效，返回基本信息
    return NextResponse.json({ 
      user: {
        ...session.user,
        subscription_type: 'free',
        daily_limit: 3,
        daily_used: 0,
      }, 
      expires: session.expires 
    });
  }
}
