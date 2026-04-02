# 🔧 Google OAuth 环境变量问题排查

## 🔍 问题诊断

### 当前状态

- ✅ 代码已部署到 Cloudflare Pages
- ✅ 环境变量已在 Dashboard 配置
- ❌ 访问 `/api/auth/login` 仍然返回 500 错误

### 可能的原因

#### 原因 1：环境变量在构建时为 undefined

**问题：** 代码在模块加载时就读取 `process.env.GOOGLE_CLIENT_ID`，但此时环境变量可能还未注入。

```typescript
// ❌ 错误写法 - 在模块级别读取
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export async function GET(request: NextRequest) {
  if (!GOOGLE_CLIENT_ID) {  // 这里可能已经是 undefined
    return NextResponse.json({ error: "Missing env" }, { status: 500 });
  }
}
```

**解决：** 在函数内部读取环境变量：

```typescript
// ✅ 正确写法 - 在函数内部读取
export async function GET(request: NextRequest) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: "Missing env" }, { status: 500 });
  }
}
```

---

## 🔧 修复方案

### 方案 1：在函数内部读取环境变量（推荐）

修改 `frontend/app/api/auth/login/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    // ✅ 在函数内部读取环境变量
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    
    // 验证环境变量
    if (!GOOGLE_CLIENT_ID) {
      console.error("Missing GOOGLE_CLIENT_ID environment variable");
      console.error("Available env vars:", Object.keys(process.env));
      return NextResponse.json(
        { error: "Server configuration error", message: "Missing GOOGLE_CLIENT_ID" },
        { status: 500 }
      );
    }
    
    // ... 其余代码
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
```

同样修改 `frontend/app/api/auth/callback/google/route.ts`：

```typescript
export async function GET(request: NextRequest) {
  // ✅ 在函数内部读取
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const AUTH_SECRET = process.env.AUTH_SECRET;
  
  // 验证
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !AUTH_SECRET) {
    console.error("Missing environment variables");
    console.error("GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID ? "present" : "missing");
    console.error("GOOGLE_CLIENT_SECRET:", GOOGLE_CLIENT_SECRET ? "present" : "missing");
    console.error("AUTH_SECRET:", AUTH_SECRET ? "present" : "missing");
    return NextResponse.redirect(new URL("/?error=missing_env", request.url));
  }
  
  // ... 其余代码
}
```

### 方案 2：使用 Next.js Middleware 注入环境变量

创建 `middleware.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // 确保环境变量可用
  const response = NextResponse.next();
  
  // 可以在这里添加环境变量验证逻辑
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

### 方案 3：使用 Cloudflare Pages 的 [vars] 配置

修改 `wrangler.toml`：

```toml
name = "watermark-tool"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"

# ✅ 直接在 wrangler.toml 中配置环境变量（仅用于本地测试）
[vars]
GOOGLE_CLIENT_ID = "your-client-id"
GOOGLE_CLIENT_SECRET = "your-client-secret"
AUTH_SECRET = "your-auth-secret"

[[d1_databases]]
binding = "DB"
database_name = "watermark-tool-db"
database_id = "7607e1d1-9605-4588-a486-9e7da2cdc749"
```

**注意：** 不要将真实凭据提交到 Git！仅用于本地测试。

---

## 🧪 测试验证

### 1. 本地测试

```bash
cd /root/.openclaw/workspace/watermark-tool/frontend

# 设置环境变量
export GOOGLE_CLIENT_ID="xxx"
export GOOGLE_CLIENT_SECRET="xxx"
export AUTH_SECRET="xxx"

# 构建并测试
npm run build
npx @cloudflare/next-on-pages
npx wrangler pages dev .vercel/output/static
```

### 2. Cloudflare Pages 测试

访问部署 URL 并查看日志：

```bash
# 查看 Functions 日志
curl -X GET "https://api.cloudflare.com/client/v4/accounts/346aad6627c9772cf089b413807a8172/pages/projects/watermark-tool/functions/logs" \
  -H "Authorization: Bearer ..."
```

### 3. 直接测试 API

```bash
curl -v "https://watermark-tool-6ky.pages.dev/api/auth/login"
# 应该返回 307 重定向到 Google
```

---

## 📊 环境变量调试技巧

### 添加调试日志

在 API route 中添加：

```typescript
export async function GET(request: NextRequest) {
  console.log("=== Environment Variables Debug ===");
  console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ present" : "❌ missing");
  console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✅ present" : "❌ missing");
  console.log("AUTH_SECRET:", process.env.AUTH_SECRET ? "✅ present" : "❌ missing");
  console.log("All env var keys:", Object.keys(process.env));
  console.log("====================================");
  
  // ... 其余代码
}
```

### 检查 Cloudflare Dashboard 环境变量

1. 访问：https://dash.cloudflare.com
2. 进入：Workers & Pages → watermark-tool → Settings → Environment variables
3. 确认变量名**完全匹配**（区分大小写）
4. 确认每个变量都勾选了 **Production** 和 **Preview**

---

## 🎯 最可能的原因和解决方案

### 最可能的原因

**Cloudflare Pages 环境变量未正确传递到 Edge Functions**

### 解决方案

1. **重新配置环境变量**
   - 删除现有的 3 个 OAuth 环境变量
   - 重新添加（确保没有空格）
   - 勾选 Production + Preview
   - Save

2. **重新部署**
   - Deployments → Retry deployment
   - 或推送新的 commit

3. **修改代码在函数内部读取环境变量**
   - 将 `const GOOGLE_CLIENT_ID = process.env.XXX` 移到函数内部
   - 添加调试日志

4. **检查 wrangler.toml**
   - 确保 `compatibility_flags = ["nodejs_compat"]`
   - 确保没有其他配置冲突

---

## 📝 下一步行动

1. **立即修复代码** - 在函数内部读取环境变量
2. **添加调试日志** - 查看哪些环境变量可用
3. **重新部署** - 触发新的构建
4. **查看日志** - 确认环境变量是否正确注入
5. **测试登录** - 验证 OAuth 流程

---

**预计修复时间：10 分钟**
