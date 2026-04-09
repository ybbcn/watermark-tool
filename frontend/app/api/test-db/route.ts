import { NextResponse } from "next/server";

export const runtime = 'edge';

export async function GET(request: Request, context: any) {
  try {
    console.log("🔍 [Test DB] Checking context:", Object.keys(context || {}));
    
    const env = context.env || {};
    console.log("🔍 [Test DB] env keys:", Object.keys(env));
    
    if (!env.DB) {
      return NextResponse.json({
        error: "DB not configured",
        message: "D1 数据库未绑定",
      }, { status: 500 });
    }
    
    console.log("✅ [Test DB] DB binding found");
    
    const result = await env.DB.prepare("SELECT 1 as test").first();
    
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
