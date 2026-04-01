import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthURL } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const url = getGoogleOAuthURL();
  return NextResponse.redirect(url);
}
