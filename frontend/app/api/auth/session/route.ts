import { NextRequest, NextResponse } from "next/server";
import { verifySession, getSessionCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const cookies = request.headers.get("cookie");
  const sessionToken = getSessionCookie(cookies);

  if (!sessionToken) {
    return NextResponse.json({ user: null });
  }

  const session = await verifySession(sessionToken);
  
  if (!session) {
    const response = NextResponse.json({ user: null });
    response.headers.set("Set-Cookie", "session=; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    return response;
  }

  return NextResponse.json({ user: session.user, expires: session.expires });
}
