import { NextResponse } from "next/server";
import { getCloudflareContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    console.log("🔍 [Test DB] Checking environment...");
    
    const env = await getCloudflareContext();
    console.log("🔍 [Test DB] env keys:", Object.keys(env || {}));
    
    if (!env || !(env as any).DB) {
      return NextResponse.json({
        error: "DB not configured",
        message: "D1 数据库未绑定",
        env_keys: env ? Object.keys(env) : [],
      }, { status: 500 });
    }
    
    console.log("✅ [Test DB] DB binding found");
    
    const db = (env as any).DB as D1Database;
    const result = await db.prepare("SELECT 1 as test").first();
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
