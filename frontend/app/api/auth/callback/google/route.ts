import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getUserInfo, createSession, createSessionCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // 处理错误
  if (error) {
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  try {
    // 交换访问令牌
    const tokenData = await exchangeCodeForToken(code);
    
    // 获取用户信息
    const userInfo = await getUserInfo(tokenData.access_token);
    
    // 创建会话
    const sessionToken = await createSession(userInfo);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // 重定向到首页并设置 Cookie
    const response = NextResponse.redirect(new URL("/", request.url));
    response.headers.set("Set-Cookie", createSessionCookie(sessionToken, expiresAt));
    
    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
