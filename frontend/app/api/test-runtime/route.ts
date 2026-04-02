import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    // 测试基本功能
    const test1 = "Hello from edge runtime";
    
    // 测试 URLSearchParams
    const params = new URLSearchParams({ test: "value" });
    const test2 = params.toString();
    
    // 测试 fetch
    const response = await fetch("https://www.google.com");
    const test3 = response.status;
    
    return NextResponse.json({
      status: "ok",
      test1,
      test2,
      test3,
      message: "Edge runtime is working!"
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
