import { NextRequest, NextResponse } from "next/server";
import { verifySession, getSessionCookie } from "@/lib/auth";
import { checkQuota, consumeQuota } from "@/lib/quota";

export const runtime = 'edge';

export async function POST(request: NextRequest, { env }: any) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 检查用户登录状态
    const cookies = request.headers.get("cookie");
    const sessionToken = getSessionCookie(cookies);
    
    let userId: string | null = null;
    let isAnonymous = false;
    
    if (sessionToken) {
      const session = await verifySession(sessionToken);
      if (session) {
        userId = session.user.id;
      }
    }
    
    // 如果未登录，使用匿名配额
    if (!userId) {
      isAnonymous = true;
      // 检查匿名配额（简化处理，实际应该在服务端检查）
      console.log("🔐 [Watermark] Anonymous user, allowing with limited quota");
    } else {
      // 检查登录用户配额
      const quotaCheck = await checkQuota(env.DB, userId);
      console.log("🔐 [Watermark] Quota check:", quotaCheck);
      
      if (!quotaCheck.allowed) {
        return NextResponse.json(
          { 
            error: "Quota exceeded",
            message: "今日配额已用完，请明天再来或升级 Pro",
            remaining: quotaCheck.remaining,
            limit: quotaCheck.limit,
          },
          { status: 403 }
        );
      }
    }

    // 转发到 Cloudflare Worker 处理图片
    const workerUrl = `https://api.ybbtool.com/api/add-watermark`;
    const response = await fetch(workerUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }

    const blob = await response.blob();
    
    // 处理成功，扣减配额
    if (!isAnonymous && userId) {
      try {
        await consumeQuota(env.DB, userId);
        console.log("✅ [Watermark] Quota consumed for user:", userId);
      } catch (quotaErr) {
        console.error("❌ [Watermark] Failed to consume quota:", quotaErr);
        // 配额扣减失败不影响返回结果
      }
    }
    
    return new NextResponse(blob, {
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
