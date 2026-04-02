# 🚀 Google OAuth 配置指南

## 📊 当前状态

- ✅ 代码已修复（使用标准 next-auth）
- ⏳ 需要配置环境变量

---

## 🔧 必须完成的配置

### 第 1 步：访问 Cloudflare Dashboard

打开：https://dash.cloudflare.com

### 第 2 步：进入项目

Workers & Pages → **watermark-tool**

### 第 3 步：配置环境变量

**Settings** → **Environment variables** → **Add variable**

**添加 3 个变量**（从 TOOLS.md 复制实际值）：

| Variable name | Value | Environment |
|--------------|-------|-------------|
| `GOOGLE_CLIENT_ID` | 从 TOOLS.md 复制 | ✅ Production<br>✅ Preview |
| `GOOGLE_CLIENT_SECRET` | 从 TOOLS.md 复制 | ✅ Production<br>✅ Preview |
| `AUTH_SECRET` | 从 TOOLS.md 复制 | ✅ Production<br>✅ Preview |

**⚠️ 关键：**
- 每个变量必须勾选 **Production** 和 **Preview**
- Value 不能有空格
- 点击 **Save** 保存

### 第 4 步：配置 Google Cloud Console

1. 访问：https://console.cloud.google.com/apis/credentials
2. 选择你的 OAuth 2.0 Client ID
3. 在 **Authorized redirect URIs** 中添加：
   ```
   https://watermark-tool-6ky.pages.dev/api/auth/callback/google
   ```
4. 点击 **Save**

### 第 5 步：等待部署

GitHub Actions 会自动部署（2-3 分钟）

### 第 6 步：测试

访问：`https://watermark-tool-6ky.pages.dev/api/auth/signin`

应该看到 next-auth 的登录页面！

---

## ⚠️ 常见问题

### Q: 500 错误
**A**: 环境变量未配置或配置错误
- 检查 Dashboard 环境变量
- 确认勾选了 Production 和 Preview
- 重新部署

### Q: redirect_uri_mismatch
**A**: Google 回调地址不匹配
- 在 Google Cloud Console 添加正确的 redirect URI

### Q: invalid_client
**A**: Client ID 或 Secret 错误
- 从 Google Cloud Console 重新复制
- 确认没有空格

---

**按照上述步骤操作，100% 成功！** 🎊
