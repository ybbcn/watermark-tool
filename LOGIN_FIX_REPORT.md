# 🔐 登录问题修复报告

## 问题现象
- Google OAuth 登录成功
- 回调后返回首页仍然显示"登录"按钮
- 个人中心入口不显示

## 根本原因
**`frontend/lib/auth.ts` 在模块顶层读取环境变量**，导致 Cloudflare Pages Edge Runtime 环境下：
- `AUTH_SECRET` 在模块加载时为 `undefined`
- 创建 session token 时使用了空的 secret
- 验证 session 时 token 无法解密
- 最终 `/api/auth/session` 返回 `user: null`

## 已修复内容

### 1. `frontend/lib/auth.ts`
**修改前：**
```typescript
const AUTH_SECRET = process.env.AUTH_SECRET!; // 模块顶层读取 ❌

export async function createSession(user: User): Promise<string> {
  const secret = new TextEncoder().encode(AUTH_SECRET);
  // ...
}
```

**修改后：**
```typescript
function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    console.error("❌ AUTH_SECRET is missing!");
    throw new Error("AUTH_SECRET is not configured");
  }
  return secret;
}

export async function createSession(user: User): Promise<string> {
  const secret = new TextEncoder().encode(getAuthSecret()); // 函数内部读取 ✅
  // ...
}
```

### 2. `frontend/app/api/auth/callback/google/route.ts`
**新增调试日志：**
- 环境变量检查日志
- Token 交换日志
- 用户信息获取日志
- DB 操作日志
- Session cookie 设置日志

**新增 redirect URI 处理：**
```typescript
// 优先使用配置的 redirect URI（必须与 Google Cloud Console 一致）
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const redirectUri = GOOGLE_REDIRECT_URI || `${protocol}://${host}/api/auth/callback/google`;
```

### 3. `frontend/app/api/auth/session/route.ts`
**新增调试日志：**
- Cookie 检测日志
- Session token 检测日志
- Session 验证结果日志
- DB 获取日志

## 下一步操作

### 方案 A：重新部署到 Cloudflare Pages（推荐）

```bash
cd /root/.openclaw/workspace/watermark-tool/frontend

# 1. 重新构建
npm run build

# 2. 重新部署到 Cloudflare Pages
npx @cloudflare/next-on-pages

# 3. 推送部署
git add .
git commit -m "fix: OAuth session auth secret reading issue"
git push
```

### 方案 B：在 Cloudflare Dashboard 手动触发重新部署

1. 访问：https://dash.cloudflare.com
2. 进入：Workers & Pages → watermark-tool
3. 点击：Deployments → Retry deployment

### 方案 C：本地测试

```bash
cd /root/.openclaw/workspace/watermark-tool/frontend

# 设置环境变量（替换成你的真实值）
export GOOGLE_CLIENT_ID="your_google_client_id"
export GOOGLE_CLIENT_SECRET="your_google_client_secret"
export GOOGLE_REDIRECT_URI="https://ybbtool.com/api/auth/callback/google"
export AUTH_SECRET="your_auth_secret"

# 构建
npm run build

# 本地预览
npx @cloudflare/next-on-pages
npx wrangler pages dev .vercel/output/static
```

## 测试验证步骤

### 1. 访问部署后的站点
```
https://ybbtool.com
```

### 2. 打开浏览器开发者工具
- F12 → Console
- 查看是否有 `[Callback]` 和 `[Session]` 开头的日志

### 3. 点击登录
- 应该跳转到 Google 授权页面

### 4. 完成授权
- 授权后应该自动跳转回首页
- 右上角应该显示你的头像，而不是"登录"按钮

### 5. 验证个人中心
- 点击头像
- 下拉菜单中应该有"个人中心"选项
- 点击进入 `/profile` 页面

### 6. 验证 API 接口
访问以下接口检查返回：

```
https://ybbtool.com/api/auth/session
```

**期望返回：**
```json
{
  "user": {
    "id": "...",
    "email": "your@email.com",
    "name": "Your Name",
    "picture": "...",
    "subscription_type": "free",
    "daily_limit": 3,
    "daily_used": 0
  },
  "expires": 1234567890
}
```

### 7. 检查浏览器 Cookie
- F12 → Application → Cookies
- 应该能看到名为 `session` 的 cookie

## 可能还需要检查的事项

### 1. Google Cloud Console 配置
确保以下配置正确：

**Authorized redirect URIs:**
```
https://ybbtool.com/api/auth/callback/google
```

**Authorized JavaScript origins:**
```
https://ybbtool.com
```

### 2. Cloudflare Pages 环境变量
访问：https://dash.cloudflare.com → Workers & Pages → watermark-tool → Settings → Environment variables

确保以下变量已配置（Production + Preview 都勾选）：

| Variable name | Value |
|--------------|-------|
| `GOOGLE_CLIENT_ID` | (你的 Google Client ID) |
| `GOOGLE_CLIENT_SECRET` | (你的 Google Client Secret) |
| `GOOGLE_REDIRECT_URI` | `https://ybbtool.com/api/auth/callback/google` |
| `AUTH_SECRET` | (你的 AUTH_SECRET) |

## 如果仍然有问题

### 查看 Cloudflare Pages 日志

```bash
# 通过 API 获取日志
curl -X GET "https://api.cloudflare.com/client/v4/accounts/346aad6627c9772cf089b413807a8172/pages/projects/watermark-tool/functions/logs" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### 检查常见错误

| 错误 | 可能原因 | 解决方案 |
|------|---------|---------|
| `redirect_uri_mismatch` | Google 控制台配置不一致 | 确保 redirect URI 完全匹配 |
| `invalid_client` | Client ID/Secret 错误 | 检查环境变量是否正确 |
| 登录后仍然显示"登录" | Session cookie 未生效 | 检查 AUTH_SECRET 是否一致 |
| 500 错误 | 环境变量缺失 | 检查 Cloudflare Dashboard 环境变量 |

## 修复完成时间
2026-04-08 17:08

## 修改的文件
1. `frontend/lib/auth.ts` - 修复 AUTH_SECRET 读取方式
2. `frontend/app/api/auth/callback/google/route.ts` - 新增调试日志和 redirect URI 处理
3. `frontend/app/api/auth/session/route.ts` - 新增调试日志

---

**下一步：重新部署并测试登录流程！** 🚀
