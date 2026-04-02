# 🚀 迁移到 Vercel 部署指南

## 📋 为什么选择 Vercel

- ✅ **Next.js 原生支持** - 由 Vercel 团队开发
- ✅ **环境变量管理稳定** - 不会像 Cloudflare Pages 那样出现空值问题
- ✅ **零配置部署** - 自动检测 Next.js 项目
- ✅ **Edge Runtime 完美支持** - 无需修改代码
- ✅ **免费额度充足** - 个人项目完全够用

---

## 🔧 部署步骤

### 第 1 步：访问 Vercel

打开：https://vercel.com/new

### 第 2 步：导入 GitHub 仓库

1. 使用 GitHub 账号登录
2. 点击 "Import Git Repository"
3. 选择 `ybbcn/watermark-tool`
4. 点击 "Import"

### 第 3 步：配置项目设置

**Framework Preset**: Next.js (自动检测)  
**Root Directory**: `frontend` ⭐ 重要  
**Build Command**: `npm run build` (默认)  
**Output Directory**: `.next` (默认)

### 第 4 步：配置环境变量 ⭐ 最关键！

**路径**: Settings → Environment Variables → Add

添加以下 3 个环境变量（从 TOOLS.md 复制实际值）：

| Variable name | Value | Environment |
|--------------|-------|-------------|
| `GOOGLE_CLIENT_ID` | （从 TOOLS.md 复制） | ✅ Production<br>✅ Preview<br>✅ Development |
| `GOOGLE_CLIENT_SECRET` | （从 TOOLS.md 复制） | ✅ Production<br>✅ Preview<br>✅ Development |
| `AUTH_SECRET` | （从 TOOLS.md 复制） | ✅ Production<br>✅ Preview<br>✅ Development |

**重要**：
- 每个变量都要勾选 **Production、Preview、Development**
- Value 必须精确复制，不能有多余空格

### 第 5 步：配置 Google OAuth 重定向 URI

访问：https://console.cloud.google.com/apis/credentials

1. 选择你的 OAuth 2.0 Client ID
2. 在 **Authorized redirect URIs** 中添加 Vercel 域名：
   ```
   https://watermark-tool-6ky.vercel.app/api/auth/callback/google
   ```
   （实际域名在部署完成后查看）
3. 点击 **Save**

### 第 6 步：部署

1. 点击 **Deploy**
2. 等待 2-3 分钟
3. 部署完成后会显示预览 URL

### 第 7 步：测试登录

1. 访问部署 URL
2. 点击 **登录** 按钮
3. 应该跳转到 Google OAuth 页面 ✅
4. 授权后返回，显示用户信息 ✅

---

## 🎯 自定义域名（可选）

如果有自定义域名 `ybbtool.com`：

### 在 Vercel 配置

1. Settings → Domains
2. 添加 `ybbtool.com`
3. 配置 DNS（按 Vercel 提示）

### 在 Google Cloud Console 更新

添加自定义域名的 redirect URI：
```
https://ybbtool.com/api/auth/callback/google
```

---

## 📊 对比 Cloudflare Pages

| 特性 | Vercel | Cloudflare Pages |
|------|--------|------------------|
| Next.js 支持 | ⭐⭐⭐⭐⭐ 原生 | ⭐⭐ 需要 next-on-pages |
| 环境变量 | ⭐⭐⭐⭐⭐ 稳定 | ⭐ 有严重 Bug |
| Edge Runtime | ⭐⭐⭐⭐⭐ 完美 | ⭐⭐ 兼容性问题 |
| 部署速度 | ⭐⭐⭐⭐ 快 | ⭐⭐⭐⭐ 快 |

---

## 🧪 本地测试（可选）

```bash
cd /root/.openclaw/workspace/watermark-tool/frontend

# 创建 .env.local
cat > .env.local << EOF
GOOGLE_CLIENT_ID=你的 Client ID
GOOGLE_CLIENT_SECRET=你的 Client Secret
AUTH_SECRET=你的 AUTH_SECRET
EOF

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

---

## ⏱️ 预计时间

- **首次部署**: 10-15 分钟
- **后续部署**: 自动触发（推送 Git 即可）

---

## ✅ 部署检查清单

- [ ] Vercel 账号已注册
- [ ] GitHub 仓库已连接
- [ ] 项目已导入（Root Directory: frontend）
- [ ] 3 个环境变量已配置
- [ ] 每个变量都勾选了 Production/Preview/Development
- [ ] Google Cloud Console 添加了 Vercel 域名的 redirect URI
- [ ] 部署成功
- [ ] 测试登录成功
- [ ] （可选）自定义域名已配置

---

**开始迁移吧！5 分钟后你的 OAuth 登录就能正常工作了！** 🎉
