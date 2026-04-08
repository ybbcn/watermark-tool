import { NextRequest, NextResponse } from "next/server";
import { verifySession, getSessionCookie } from "@/lib/auth";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const cookies = request.headers.get("cookie");
  const sessionToken = getSessionCookie(cookies);

  return NextResponse.json({
    "debug": {
      "cookies_header_present": cookies ? "yes" : "no",
      "cookies_header_length": cookies ? cookies.length : 0,
      "session_token_found": sessionToken ? "yes" : "no",
      "session_token_length": sessionToken ? sessionToken.length : 0,
    },
    "cookies": cookies,
    "session_token": sessionToken,
  });
}
