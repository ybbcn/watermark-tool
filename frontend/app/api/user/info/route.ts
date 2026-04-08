import { NextRequest, NextResponse } from "next/server";
import { verifySession, getSessionCookie } from "@/lib/auth";
import { getUser, getUserStats, getRecentUsage } from "@/lib/db";

export const runtime = "edge";

export async function GET(request: NextRequest, { env }: { env: { DB: D1Database | any } }) {
  const cookies = request.headers.get("cookie");
  const sessionToken = getSessionCookie(cookies);

  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifySession(sessionToken);
  if (!session) {
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
