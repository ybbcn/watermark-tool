import { NextRequest, NextResponse } from "next/server";
import { verifySession, getSessionCookie } from "@/lib/auth";
import { consumeQuota } from "@/lib/db";

export const runtime = 'edge';

declare const __cf_env__: any;

function getDB(): any {
  if ((globalThis as any).DB) return (globalThis as any).DB;
  if ((process.env as any).DB) return (process.env as any).DB;
  if (typeof __cf_env__ !== 'undefined' && __cf_env__.DB) return __cf_env__.DB;
  return null;
}

/**
 * 扣减配额 API
 * 纯扣减接口，不处理图片
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
    
    const cookies = request.headers.get("cookie");
    const sessionToken = getSessionCookie(cookies);
    
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const session = await verifySession(sessionToken);
    
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // 扣减配额
    const consumed = await consumeQuota(db, userId);
    
    if (consumed) {
      console.log(`✅ [Consume Quota] User ${userId} quota consumed`);
      return NextResponse.json({ success: true, message: "配额已扣减" });
    } else {
      console.warn(`⚠️ [Consume Quota] User ${userId} quota consume failed`);
      return NextResponse.json(
        { error: "Quota exceeded", message: "配额已用完" },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error("❌ [Consume Quota] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
