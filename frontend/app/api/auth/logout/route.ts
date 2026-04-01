import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.headers.set("Set-Cookie", clearSessionCookie());
  return response;
}
