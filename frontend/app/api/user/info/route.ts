import { NextRequest, NextResponse } from "next/server";
import { verifySession, getSessionCookie } from "@/lib/auth";
import { getUser, getUserStats, getRecentUsage } from "@/lib/db";

export const runtime = "edge";

export async function GET(request: NextRequest, { env }: any) {
  const cookies = request.headers.get("cookie");
  const sessionToken = getSessionCookie(cookies);

  console.log("🔐 [User Info] Checking auth...");
  console.log("🔐 [User Info] Cookies present:", cookies ? "yes" : "no");
  console.log("🔐 [User Info] Session token found:", sessionToken ? "yes" : "no");

  if (!sessionToken) {
    console.log("🔐 [User Info] No session token, returning 401");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifySession(sessionToken);
  console.log("🔐 [User Info] Session verification:", session ? "success" : "failed");
  
  if (!session) {
    console.log("🔐 [User Info] Invalid session, returning 401");
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const user = await getUser(env.DB, session.user.id);
  const stats = await getUserStats(env.DB, session.user.id);
  const recentUsage = await getRecentUsage(env.DB, session.user.id, 5);

  return NextResponse.json({
    user: {
      ...session.user,
      subscription_type: user?.subscription_type || 'free',
      daily_limit: user?.daily_limit || 3,
      daily_used: user?.daily_used || 0,
    },
    stats,
    recentUsage: recentUsage.map(log => ({
      ...log,
      created_at: new Date(log.created_at * 1000).toISOString(),
    })),
  });
}
