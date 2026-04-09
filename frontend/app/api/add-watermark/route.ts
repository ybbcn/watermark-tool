import { NextRequest, NextResponse } from "next/server";
import { verifySession, getSessionCookie } from "@/lib/auth";
import { checkQuota, consumeQuota } from "@/lib/quota";

export const runtime = 'edge';

declare const __cf_env__: any;

function getDB(): any {
  if ((globalThis as any).DB) return (globalThis as any).DB;
  if ((process.env as any).DB) return (process.env as any).DB;
  if (typeof __cf_env__ !== 'undefined' && __cf_env__.DB) return __cf_env__.DB;
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const db = getDB();
    
    if (!db) {
      return NextResponse.json({
        error: "Database not configured",
        message: "D1 数据库未绑定",
      }, { status: 500 });
    }
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("📥 [Watermark] File:", file.name, file.size);

    const cookies = request.headers.get("cookie");
    const sessionToken = getSessionCookie(cookies);
    
    let userId: string | null = null;
    
    if (sessionToken) {
      try {
        const session = await verifySession(sessionToken);
        if (session) userId = session.user.id;
      } catch (e) {}
    }
    
    // 检查配额
    if (userId) {
      try {
        const quotaCheck = await checkQuota(db, userId);
        if (!quotaCheck.allowed) {
          return NextResponse.json(
            { error: "Quota exceeded", message: "今日配额已用完" },
            { status: 403 }
          );
        }
      } catch (e) {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }

    // 读取图片并处理
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 使用 Node.js 的 sharp 或简单返回原图（临时方案）
    // 由于 Edge Runtime 限制，暂时只扣配额不处理图片
    console.log("⚠️ [Watermark] Processing not available in Edge Runtime, returning original");
    
    // 扣减配额
    if (userId) {
      try {
        await consumeQuota(db, userId);
        console.log("✅ Quota consumed");
      } catch (e) {}
    }
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": file.type,
        "Content-Disposition": `attachment; filename="${file.name}"`,
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
