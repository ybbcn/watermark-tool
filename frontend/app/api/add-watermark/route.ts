import { NextRequest, NextResponse } from "next/server";
import { verifySession, getSessionCookie } from "@/lib/auth";
import { checkAndConsumeQuota } from "@/lib/db";

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
    
    // 使用原子操作检查并扣减配额（防止并发问题）
    let quotaRemaining = -1;
    let quotaLimit = -1;
    
    if (userId) {
      try {
        const result = await checkAndConsumeQuota(db, userId);
        quotaRemaining = result.remaining;
        quotaLimit = result.limit;
        
        console.log(`📊 [Quota] After check&consume: ${result.remaining}/${result.limit} remaining, allowed=${result.allowed}`);
        
        if (!result.allowed) {
          console.log(`❌ [Quota] Exceeded for user ${userId}`);
          return NextResponse.json(
            { error: "Quota exceeded", message: "今日配额已用完" },
            { status: 403 }
          );
        }
      } catch (e) {
        console.error("❌ [Quota] Check&consume failed:", e);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }

    // 读取图片
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log("📥 [Watermark] Processing image...");
    
    // 读取表单中的水印参数
    const text = formData.get("text") as string || "水印";
    const position = formData.get("position") as string || "bottom-right";
    const opacity = parseFloat(formData.get("opacity") as string) || 1.0;
    const fontSize = parseInt(formData.get("fontSize") as string) || 48;
    const color = formData.get("color") as string || "#FFFFFF";
    
    console.log(`📝 [Watermark] Text: ${text}, Position: ${position}, Opacity: ${opacity}, FontSize: ${fontSize}, Color: ${color}`);
    
    // 使用 sharp 处理图片（需要 Node.js 环境）
    // 由于 Edge Runtime 不支持 sharp，暂时返回原图并记录日志
    // TODO: 在 backend Python 服务中实现水印处理
    
    console.log("⚠️ [Watermark] Edge Runtime 不支持图片处理，返回原图。水印处理功能需要部署 backend 服务。");
    
    // 返回原图（带日志说明）
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": file.type || 'image/jpeg',
        "Content-Disposition": `attachment; filename="${file.name}"`,
        "X-Watermark-Note": "水印处理需要 backend 服务，当前返回原图",
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
