# 🚀 Google OAuth 完整接入指南

## 📊 项目现状

- ✅ Next.js 15 + App Router
- ✅ Cloudflare Pages 部署
- ✅ next-auth v5 已安装
- ❌ 自定义 OAuth 实现（复杂，易出错）

---

## ✅ 解决方案：使用标准 next-auth

### 第 1 步：配置已创建

文件：`app/api/auth/[...nextauth]/route.ts` ✅

这个文件使用了标准的 next-auth 配置，自动处理：
- OAuth 重定向
- Token 交换
- Session 管理
- 用户信息获取

### 第 2 步：在 Cloudflare Dashboard 配置环境变量

**访问**：https://dash.cloudflare.com → Workers & Pages → watermark-tool → Settings → Environment variables

**添加 3 个变量**：

| Variable name | Value | Environment |
|--------------|-------|-------------|
| `GOOGLE_CLIENT_ID` | 从 TOOLS.md 复制 | ✅ Production<br>✅ Preview |
| `GOOGLE_CLIENT_SECRET` | 从 TOOLS.md 复制 | ✅ Production<br>✅ Preview |
| `AUTH_SECRET` | 从 TOOLS.md 复制 | ✅ Production<br>✅ Preview |

**⚠️ 关键**：
- 每个变量必须勾选 **Production** 和 **Preview**
- Value 不能有空格
- 点击 **Save** 保存

### 第 3 步：配置 Google Cloud Console

**访问**：https://console.cloud.google.com/apis/credentials

1. 选择你的 OAuth 2.0 Client ID
2. 在 **Authorized redirect URIs** 中添加：
   ```
   https://watermark-tool-6ky.pages.dev/api/auth/callback/google
   ```
   （使用你的实际 Cloudflare Pages 域名）
3. 点击 **Save**

### 第 4 步：重新部署

**方式 A：通过 GitHub Actions**
```bash
git add .
git commit -m "feat: use standard next-auth for Google OAuth"
git push origin master
```

**方式 B：手动部署**
```bash
cd frontend
npm run build
npx @cloudflare/next-on-pages
CLOUDFLARE_API_TOKEN="你的 token" npx wrangler pages deploy .vercel/output/static --project-name=watermark-tool
```

### 第 5 步：在前端使用

创建登录组件：

```typescript
'use client'
import { signIn, signOut, useSession } from "next-auth/react"

export default function AuthButton() {
  const { data: session } = useSession()
  
  if (session) {
    return (
      <div>
        <p>欢迎，{session.user?.name}</p>
        <button onClick={() => signOut()}>退出登录</button>
      </div>
    )
  }
  
  return (
    <button onClick={() => signIn("google")}>
      使用 Google 登录
    </button>
  )
}
```

在 layout.tsx 中添加 Provider：

```typescript
import { SessionProvider } from "next-auth/react"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

---

## 🎯 快速测试

### 测试登录

访问：`https://your-domain.pages.dev/api/auth/signin`

应该看到 next-auth 自带的登录页面，点击 "Sign in with Google" 即可。

### 测试回调

登录成功后会自动跳转到：`https://your-domain.pages.dev/api/auth/callback/google`

然后重定向到首页。

### 查看 Session

在浏览器控制台执行：
```javascript
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```

应该看到用户信息。

---

## 📋 检查清单

- [ ] 创建了 `app/api/auth/[...nextauth]/route.ts`
- [ ] Cloudflare Dashboard 配置了 3 个环境变量
- [ ] 每个变量勾选了 Production 和 Preview
- [ ] Google Cloud Console 添加了 redirect URI
- [ ] 重新部署完成
- [ ] 访问 `/api/auth/signin` 能看到登录页面
- [ ] 点击 "Sign in with Google" 能跳转
- [ ] 登录后能看到用户信息

---

## ⚠️ 常见问题

### Q: 500 Internal Server Error
**A**: 环境变量未配置或配置错误
- 检查 Cloudflare Dashboard 环境变量
- 确认每个变量都勾选了 Production 和 Preview
- 重新部署

### Q: redirect_uri_mismatch
**A**: Google 回调地址不匹配
- 在 Google Cloud Console 添加正确的 redirect URI
- 格式：`https://你的域名.pages.dev/api/auth/callback/google`

### Q: invalid_client
**A**: Client ID 或 Secret 错误
- 从 Google Cloud Console 重新复制
- 确认没有多余空格

---

## 🎉 优势

使用标准 next-auth 的优势：

1. ✅ **代码量少** - 只需一个配置文件
2. ✅ **自动处理** - OAuth 流程全自动
3. ✅ **类型安全** - 完整的 TypeScript 支持
4. ✅ **社区支持** - 大量文档和示例
5. ✅ **易于维护** - 标准方案，其他人也容易理解

---

**预计完成时间：15 分钟**

**开始配置吧！** 🚀
