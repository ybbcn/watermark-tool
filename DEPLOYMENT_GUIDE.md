# 🚀 Google OAuth 完整部署指南

## 📋 问题根源

GitHub Actions 的 `deploy.yml` 中，环境变量只在**构建时**传递：

```yaml
- name: Build with Next.js
  run: npm run build
  env:
    GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
    GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}
```

但 Cloudflare Pages 是 **Serverless 架构**，代码在 Edge 运行时**无法访问构建时的环境变量**！

---

## ✅ 解决方案

### 方案 A：Cloudflare Dashboard 手动配置（推荐 ⭐⭐⭐⭐⭐）

**优点**：简单直接，5 分钟搞定  
**缺点**：需要手动操作一次

#### 步骤 1：访问 Cloudflare Dashboard

打开：https://dash.cloudflare.com

#### 步骤 2：进入 Pages 项目

1. 左侧菜单：**Workers & Pages**
2. 找到并点击：`watermark-tool`
3. 点击左侧：**Settings**
4. 点击：**Environment variables**

#### 步骤 3：添加环境变量

点击 **"+ Add variable"**，依次添加以下 3 个变量：

| Variable name | Value | Production | Preview |
|--------------|-------|------------|---------|
| `GOOGLE_CLIENT_ID` | （从 TOOLS.md 复制） | ✅ 勾选 | ✅ 勾选 |
| `GOOGLE_CLIENT_SECRET` | （从 TOOLS.md 复制） | ✅ 勾选 | ✅ 勾选 |
| `AUTH_SECRET` | （从 TOOLS.md 复制） | ✅ 勾选 | ✅ 勾选 |

**重要**：
- ✅ 必须同时勾选 **Production** 和 **Preview**
- ✅ Value 必须精确复制，不能有多余空格

💡 **提示**：你的 Google OAuth 凭据已经记录在 `/root/.openclaw/workspace/TOOLS.md` 中

#### 步骤 4：重新部署

环境变量配置后需要重新部署才能生效：

1. 点击左侧：**Deployments**
2. 找到最新的部署
3. 点击右侧的 **⋮**（三个点）
4. 选择：**Retry deployment**

或者推送一个新的 commit 触发自动部署。

#### 步骤 5：验证

部署完成后：
1. 访问：https://ybbtool.com 或 https://watermark-tool-6ky.pages.dev
2. 点击右上角 **登录** 按钮
3. 应该正常跳转到 Google 授权页面

---

## 🧪 本地测试（可选）

```bash
cd /root/.openclaw/workspace/watermark-tool/frontend

# 运行配置脚本（会提示输入环境变量）
./setup-env.sh

# 或者手动创建 .env.local 文件
cat > .env.local << EOF
GOOGLE_CLIENT_ID=你的 Client ID
GOOGLE_CLIENT_SECRET=你的 Client Secret
AUTH_SECRET=你的 AUTH_SECRET
EOF

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 测试登录

---

## 🐛 常见问题

### 1. 部署后仍然报 500 错误

**检查**：
- Cloudflare Dashboard → Pages → watermark-tool → Deployments
- 点击最新部署 → View logs
- 查看是否有错误信息

**解决**：
- 确认环境变量已正确配置（Production 和 Preview 都勾选）
- 确认已重新部署（Retry deployment）

### 2. redirect_uri_mismatch 错误

**原因**：Google Cloud Console 中的 redirect URI 与实际访问域名不匹配

**解决**：
1. 打开：https://console.cloud.google.com/apis/credentials
2. 选择你的 OAuth 2.0 Client ID
3. 在 **Authorized redirect URIs** 中添加：
   ```
   https://ybbtool.com/api/auth/callback/google
   https://watermark-tool-6ky.pages.dev/api/auth/callback/google
   ```
4. 保存后等待几分钟生效

### 3. invalid_client 错误

**原因**：Client ID 或 Secret 配置错误

**解决**：
- 检查 Cloudflare 环境变量是否正确
- 确认没有多余的空格或换行
- 重新从 Google Cloud Console 复制凭据

### 4. 登录后无限循环

**原因**：AUTH_SECRET 未配置或 Cookie 设置问题

**解决**：
- 确认 AUTH_SECRET 已配置
- 清除浏览器缓存和 Cookie
- 使用无痕模式测试

---

## 📞 快速操作清单

### 方案 A（推荐）- 5 分钟搞定

- [ ] 打开 https://dash.cloudflare.com
- [ ] 进入 Workers & Pages → watermark-tool
- [ ] 点击 Settings → Environment variables
- [ ] 添加 3 个环境变量（GOOGLE_CLIENT_ID、GOOGLE_CLIENT_SECRET、AUTH_SECRET）
- [ ] 勾选 Production 和 Preview
- [ ] 点击 Save
- [ ] 进入 Deployments → Retry deployment
- [ ] 等待部署完成（约 2-3 分钟）
- [ ] 访问 https://ybbtool.com 测试登录

---

## 🔗 相关链接

- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Cloudflare Pages 环境变量**: https://developers.cloudflare.com/pages/functions/bindings/#environment-variables
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **wrangler 文档**: https://developers.cloudflare.com/workers/wrangler/

---

**推荐立即执行方案 A**，配置完成后 OAuth 登录应该就能正常工作了！🎉
