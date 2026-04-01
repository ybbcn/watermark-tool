import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthURL } from "@/lib/auth";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const url = getGoogleOAuthURL();
  return NextResponse.redirect(url);
}
