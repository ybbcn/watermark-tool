import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  // 诊断环境变量
  const envDebug = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "✅ present" : "❌ missing",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "✅ present" : "❌ missing",
    AUTH_SECRET: process.env.AUTH_SECRET ? "✅ present" : "❌ missing",
    NODE_ENV: process.env.NODE_ENV || "undefined",
    CLOUDFLARE_PAGES: process.env.CLOUDFLARE_PAGES || "undefined",
    allKeys: Object.keys(process.env).sort(),
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    runtime: "edge",
    env: envDebug,
    headers: {
      host: request.headers.get("host"),
      "x-forwarded-proto": request.headers.get("x-forwarded-proto"),
    },
  });
}
