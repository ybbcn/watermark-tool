import { NextRequest, NextResponse } from "next/server";
import { verifySession, getSessionCookie } from "@/lib/auth";
import { checkQuota, consumeQuota } from "@/lib/quota";
import { getCloudflareContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 [Watermark] Getting Cloudflare context...");
    const env = await getCloudflareContext();
    const db = (env as any).DB as D1Database;
    
    if (!db) {
      console.error("❌ [Watermark] DB not configured");
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

    console.log("📥 [Watermark] Received file:", file.name, file.size, "bytes");

    // 检查用户登录状态
    const cookies = request.headers.get("cookie");
    const sessionToken = getSessionCookie(cookies);
    
    let userId: string | null = null;
    let isAnonymous = false;
    
    if (sessionToken) {
      try {
        const session = await verifySession(sessionToken);
        if (session) {
          userId = session.user.id;
          console.log("✅ [Watermark] User authenticated:", userId);
        }
      } catch (authErr) {
        console.warn("⚠️ [Watermark] Auth failed:", authErr);
      }
    }
    
    // 如果未登录，使用匿名配额
    if (!userId) {
      isAnonymous = true;
      console.log("🔐 [Watermark] Anonymous user");
    } else {
      // 检查登录用户配额
      try {
        const quotaCheck = await checkQuota(db, userId);
        console.log("🔐 [Watermark] Quota check for user", userId, ":", quotaCheck);
        
        if (!quotaCheck.allowed) {
          console.warn("⚠️ [Watermark] User", userId, "quota exceeded");
          return NextResponse.json(
            { 
              error: "Quota exceeded",
              message: "今日配额已用完，请明天再来或升级 Pro",
            },
            { status: 403 }
          );
        }
      } catch (dbErr) {
        console.error("❌ [Watermark] DB error:", dbErr);
        return NextResponse.json(
          {
            error: "Database error",
            message: "无法验证配额",
          },
          { status: 500 }
        );
      }
    }

    // 在 Edge 环境中使用 Canvas 处理图片
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const imageBitmap = await createImageBitmap(new Blob([uint8Array]));
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error("Cannot get canvas context");
    }
    
    ctx.drawImage(imageBitmap, 0, 0);
    ctx.font = `${Math.floor(canvas.width / 20)}px Arial`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText("Watermark", canvas.width - 20, canvas.height - 20);
    
    const processedBlob = await canvas.convertToBlob({
      type: "image/jpeg",
      quality: 0.95,
    });
    
    console.log("✅ [Watermark] Image processed successfully");
    
    // 处理成功，扣减配额
    if (!isAnonymous && userId) {
      try {
        const consumed = await consumeQuota(db, userId);
        console.log(consumed ? "✅ [Watermark] Quota consumed" : "⚠️ [Watermark] Quota NOT consumed");
      } catch (quotaErr) {
        console.error("❌ [Watermark] Failed to consume quota:", quotaErr);
      }
    }
    
    return new NextResponse(processedBlob, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": 'attachment; filename="watermarked.jpg"',
      },
    });
  } catch (error) {
    console.error("❌ [Watermark] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
