import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "✅ present" : "❌ missing",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "✅ present" : "❌ missing",
    AUTH_SECRET: process.env.AUTH_SECRET ? "✅ present" : "❌ missing",
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI ? "✅ present" : "❌ missing",
  });
}
