import { NextResponse } from "next/server";

export const runtime = 'edge';

// @ts-ignore - Cloudflare Pages 环境
declare const __cf_env__: any;

export async function GET(request: Request) {
  try {
    console.log("🔍 [Test DB] Starting...");
    
    // 尝试多种方式获取 env
    let db: any = null;
    
    // 方式 1: 通过 globalThis
    if ((globalThis as any).DB) {
      db = (globalThis as any).DB;
      console.log("✅ Found DB via globalThis");
    }
    // 方式 2: 通过 process.env
    else if ((process.env as any).DB) {
      db = (process.env as any).DB;
      console.log("✅ Found DB via process.env");
    }
    // 方式 3: 通过 __cf_env__
    else if (typeof __cf_env__ !== 'undefined' && __cf_env__.DB) {
      db = __cf_env__.DB;
      console.log("✅ Found DB via __cf_env__");
    }
    
    if (!db) {
      console.error("❌ DB not found in any source");
      return NextResponse.json({
        error: "DB not configured",
        message: "D1 数据库未绑定",
        globals: Object.keys(globalThis).filter(k => k.toLowerCase().includes('db')),
      }, { status: 500 });
    }
    
    console.log("✅ DB object found, testing connection...");
    
    const result = await db.prepare("SELECT 1 as test").first();
    
    return NextResponse.json({
      success: true,
      message: "数据库连接正常",
      result,
    });
  } catch (error) {
    console.error("❌ [Test DB] Error:", error);
    return NextResponse.json({
      error: "Database error",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
