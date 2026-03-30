import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 转发到 Cloudflare Worker
    const workerUrl = `https://api.ybbtool.com/api/add-watermark`;
    const response = await fetch(workerUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }

    const blob = await response.blob();
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": 'attachment; filename="watermarked.jpg"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
