import { NextResponse } from "next/server";
import type { PlatformProxy } from "wrangler";

type Cloudflare = PlatformProxy<{
  DB: D1Database;
}>;

interface GetCloudflareContext {
  cf: Cloudflare["cf"];
  env: Cloudflare["env"];
  ctx: Cloudflare["ctx"];
}

function getCloudflareContext(request: Request): GetCloudflareContext {
  return (request as any).cf as GetCloudflareContext;
}

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { env } = getCloudflareContext(request);
    
    console.log("🔍 [Test DB] Checking environment...");
    
    if (!env || !env.DB) {
      return NextResponse.json({
        error: "DB not configured",
        message: "D1 数据库未绑定",
      }, { status: 500 });
    }
    
    console.log("✅ [Test DB] DB binding found");
    
    const result = await env.DB.prepare("SELECT 1 as test").first();
    console.log("✅ [Test DB] Query result:", result);
    
    return NextResponse.json({
      success: true,
      message: "数据库连接正常",
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ [Test DB] Error:", error);
    return NextResponse.json({
      error: "Database error",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
