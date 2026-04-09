import { NextResponse } from "next/server";

export const runtime = 'edge';

export async function GET(request: Request, { env }: any) {
  try {
    console.log("🔍 [Test DB] Checking environment...");
    console.log("🔍 [Test DB] env:", Object.keys(env || {}));
    
    if (!env.DB) {
      return NextResponse.json({
        error: "DB not configured",
        message: "D1 数据库未绑定，请检查 Cloudflare Pages 配置",
        env_keys: Object.keys(env || {}),
      }, { status: 500 });
    }
    
    console.log("✅ [Test DB] DB binding found");
    
    // 测试数据库连接
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
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
