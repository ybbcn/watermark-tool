import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  // 不依赖任何外部库，直接返回
  return new NextResponse(
    JSON.stringify({ 
      status: "ok", 
      message: "Simple test works!",
      url: request.url,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
