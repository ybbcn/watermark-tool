# 🔍 Google OAuth 500 错误 - 快速排查指南

## ✅ 已生成的 NEXTAUTH_SECRET

```bash
openssl rand -hex 32
# 输出：5cae5bda44d65fdad96d5a00de201077b224a50f7960058565a4745e70020990
```

**特性：**
- ✅ 64 字符随机字符串
- ✅ 符合 NextAuth 要求

---

## 🚀 立即修复（3 步，5 分钟）

### 第 1 步：在 Vercel 配置环境变量

访问：https://vercel.com/dashboard → 选择项目 → Settings → Environment Variables → Add

**添加 3 个变量：**

| Variable name | Value | Environment |
|--------------|-------|-------------|
| `NEXTAUTH_SECRET` | （从 TOOLS.md 复制，或使用上面生成的） | ✅ Production<br>✅ Preview<br>✅ Development |
| `GOOGLE_CLIENT_ID` | （从 TOOLS.md 复制） | ✅ Production<br>✅ Preview<br>✅ Development |
| `GOOGLE_CLIENT_SECRET` | （从 TOOLS.md 复制） | ✅ Production<br>✅ Preview<br>✅ Development |

**⚠️ 关键：** 每个变量必须勾选所有 3 个环境！

### 第 2 步：重新部署

Deployments → 最新部署 → ⋮ → **Redeploy**

### 第 3 步：测试

访问部署 URL → 点击登录 → 应该跳转到 Google OAuth ✅

---

## 📋 检查清单

### Vercel 环境变量

- [ ] NEXTAUTH_SECRET 已配置（64 字符）
- [ ] GOOGLE_CLIENT_ID 已配置
- [ ] GOOGLE_CLIENT_SECRET 已配置
- [ ] 每个变量勾选了 Production/Preview/Development
- [ ] 已重新部署

### Google Cloud Console

- [ ] Authorized redirect URIs 已添加 Vercel 域名
- [ ] 格式：`https://xxx.vercel.app/api/auth/callback/google`
- [ ] 使用 HTTPS

---

## ⚠️ 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| 500 | NEXTAUTH_SECRET 未配置 | 在 Vercel 配置环境变量 |
| 500 | NEXTAUTH_SECRET 太短 | 使用 `openssl rand -hex 32` 重新生成 |
| redirect_uri_mismatch | Google 回调地址不匹配 | 在 Google Cloud Console 添加 Vercel 域名 |
| invalid_client | Client ID/Secret 错误 | 从 Google Cloud Console 重新复制 |

---

## 🎯 问题诊断

**500 错误 = NextAuth 启动失败**

**99% 原因：**
1. NEXTAUTH_SECRET 未配置
2. NEXTAUTH_SECRET 太短/无效
3. 环境变量未勾选 Production/Preview/Development

**解决方案：** 补全环境变量 + Redeploy

---

**预计解决时间：5 分钟**
