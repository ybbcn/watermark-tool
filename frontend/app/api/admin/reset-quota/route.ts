import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

declare const __cf_env__: any;

function getDB(): any {
  if ((globalThis as any).DB) return (globalThis as any).DB;
  if ((process.env as any).DB) return (process.env as any).DB;
  if (typeof __cf_env__ !== 'undefined' && __cf_env__.DB) return __cf_env__.DB;
  return null;
}

/**
 * 管理员接口：重置所有用户配额
 * 临时用于紧急修复
 */
export async function POST(request: NextRequest) {
  try {
    const db = getDB();
    
    if (!db) {
      return NextResponse.json({
        error: "Database not configured",
        message: "D1 数据库未绑定",
      }, { status: 500 });
    }
    
    // 重置所有用户的每日配额
    const result = await db.prepare(`
      UPDATE users 
      SET daily_used = 0, daily_reset_at = strftime('%s', 'now')
      WHERE subscription_type = 'free' OR subscription_type = 'pro' OR subscription_type = 'enterprise'
    `).run();
    
    console.log(`✅ 已重置 ${result.meta.changes} 个用户的配额`);
    
    return NextResponse.json({
      success: true,
      message: "配额已重置",
      resetCount: result.meta.changes,
    });
  } catch (error) {
    console.error("❌ 重置配额失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "重置失败" },
      { status: 500 }
    );
  }
}

/**
 * 查询所有用户配额状态
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }
    
    const { results } = await db.prepare(`
      SELECT id, email, name, subscription_type, daily_limit, daily_used 
      FROM users
      ORDER BY email
    `).all();
    
    return NextResponse.json({
      users: results,
      count: results.length,
    });
  } catch (error) {
    console.error("❌ 查询失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "查询失败" },
      { status: 500 }
    );
  }
}
