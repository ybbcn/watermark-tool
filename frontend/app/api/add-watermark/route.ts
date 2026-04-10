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
    
    console.log(`📝 [Watermark] Text: ${text}, Position: ${position}, Opacity: ${opacity}`);
    
    // 使用 Canvas 在 Edge Runtime 中处理图片
    try {
      // 创建 ImageBitmap
      const imageBitmap = await createImageBitmap(new Blob([buffer]));
      
      // 创建 canvas
      const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      // 绘制原图
      ctx.drawImage(imageBitmap, 0, 0);
      
      // 绘制水印文字
      ctx.globalAlpha = opacity;
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'bottom';
      
      const metrics = ctx.measureText(text);
      const textWidth = metrics.width;
      const textHeight = fontSize;
      const padding = 10;
      
      let x = padding;
      let y = canvas.height - padding;
      
      switch (position) {
        case 'top-left':
          x = padding;
          y = padding + textHeight;
          break;
        case 'top-right':
          x = canvas.width - textWidth - padding;
          y = padding + textHeight;
          break;
        case 'bottom-left':
          x = padding;
          y = canvas.height - padding;
          break;
        case 'bottom-right':
          x = canvas.width - textWidth - padding;
          y = canvas.height - padding;
          break;
        case 'center':
          x = (canvas.width - textWidth) / 2;
          y = (canvas.height + textHeight) / 2;
          break;
      }
      
      ctx.fillText(text, x, y);
      ctx.globalAlpha = 1.0;
      
      // 导出图片
      const processedBlob = await canvas.convertToBlob({
        type: file.type || 'image/jpeg',
        quality: 0.95,
      });
      
      const processedBuffer = await processedBlob.arrayBuffer();
      
      console.log("✅ [Watermark] Processing complete");
      
      return new NextResponse(processedBuffer, {
        status: 200,
        headers: {
          "Content-Type": file.type || 'image/jpeg',
          "Content-Disposition": `attachment; filename="watermarked_${file.name}"`,
        },
      });
    } catch (error) {
      console.error("❌ [Watermark] Processing error:", error);
      // 如果处理失败，返回原图
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": file.type,
          "Content-Disposition": `attachment; filename="${file.name}"`,
        },
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
