# 🔐 Google Cloud Console 配置指南

## 第一步：访问 Google Cloud Console

1. 打开浏览器访问：https://console.cloud.google.com/apis/credentials
2. 使用你的 Google 账号登录

---

## 第二步：创建或选择项目

### 如果是新项目：
1. 点击顶部项目选择器（显示"Select a project"）
2. 点击 **"NEW PROJECT"**（新建项目）
3. 输入项目名称：`Watermark Tool`
4. 点击 **"CREATE"**（创建）
5. 等待项目创建完成，点击 **"SELECT PROJECT"**

### 如果已有项目：
1. 点击顶部项目选择器
2. 选择你的项目

---

## 第三步：配置 OAuth 同意屏幕

1. 在左侧菜单中，点击 **"OAuth consent screen"**（OAuth 同意屏幕）
   - 完整路径：APIs & Services > OAuth consent screen

2. 选择用户类型：
   - ⚪ **External**（外部）- 任何 Google 用户都可以登录
   - ⚪ Internal（内部）- 仅限组织内用户（仅 Google Workspace 账号）
   - **选择 External**

3. 点击 **"CREATE"**（创建）

4. 填写应用信息：

   | 字段 | 填写内容 |
   |------|---------|
   | App name（应用名称） | `Watermark Tool` |
   | User support email（用户支持电子邮件） | 选择你的邮箱 |
   | App logo（应用图标） | 可选 |
   | Application home page（应用主页） | `https://ybbtool.com` |
   | Authorized domains（授权网域） | 点击 **"+ ADD DOMAIN"** → 输入 `ybbtool.com` |
   | Developer contact email（开发者联系邮箱） | 选择你的邮箱 |

5. 点击 **"SAVE AND CONTINUE"**（保存并继续）

6. **Scopes 页面**：
   - 直接点击 **"SAVE AND CONTINUE"**（我们只需要基本的用户信息）

7. **Test users 页面**（如果选择了 External）：
   - 点击 **"+ ADD USERS"**
   - 添加你的测试 Google 账号（例如：你的 Gmail 地址）
   - ⚠️ **重要**：在应用发布前，只有添加的测试用户才能登录
   - 点击 **"SAVE AND CONTINUE"**

8. 点击 **"BACK TO DASHBOARD"**（返回仪表板）

---

## 第四步：创建 OAuth 2.0 Client ID

1. 在左侧菜单中，点击 **"Credentials"**（凭据）
   - 完整路径：APIs & Services > Credentials

2. 点击顶部 **"+ CREATE CREDENTIALS"**（创建凭据）

3. 选择 **"OAuth client ID"**

4. 填写配置：

   | 字段 | 填写内容 |
   |------|---------|
   | Application type（应用类型） | **Web application**（Web 应用） |
   | Name（名称） | `Watermark Tool Web Client` |

5. **Authorized JavaScript origins（授权的 JavaScript 源）**：
   
   点击 **"+ ADD URI"**，添加以下三个 URL：
   ```
   https://ybbtool.com
   https://watermark-tool-6ky.pages.dev
   https://9e8974e.watermark-tool-6ky.pages.dev
   ```

6. **Authorized redirect URIs（授权的重定向 URI）**：
   
   点击 **"+ ADD URI"**，添加以下三个 URL：
   ```
   https://ybbtool.com/api/auth/callback/google
   https://watermark-tool-6ky.pages.dev/api/auth/callback/google
   https://9e8974e.watermark-tool-6ky.pages.dev/api/auth/callback/google
   ```

   ⚠️ **重要**：
   - 必须精确匹配，包括 `https://` 和末尾的 `/api/auth/callback/google`
   - 不要添加额外的斜杠或空格

7. 点击 **"CREATE"**（创建）

---

## 第五步：复制凭据到 Cloudflare

创建成功后，会弹出一个窗口显示你的凭据：

```
Your Client ID
118745016780-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com

Your Client Secret
GOCSPX-XXXXXXXXXXXXXXXXXXXX
```

### 配置到 Cloudflare Pages：

1. 访问 Cloudflare Dashboard: https://dash.cloudflare.com
2. 进入 **Workers & Pages** → 选择 `watermark-tool` 项目
3. 点击左侧 **"Settings"** → **"Environment variables"**
4. 点击 **"+ Add variable"**

添加以下变量：

| Variable name | Value | Production | Preview |
|--------------|-------|------------|---------|
| `GOOGLE_CLIENT_ID` | 从 Google 复制的 Client ID | ✅ | ✅ |
| `GOOGLE_CLIENT_SECRET` | 从 Google 复制的 Client Secret | ✅ | ✅ |
| `GOOGLE_REDIRECT_URI` | `https://ybbtool.com/api/auth/callback/google` | ✅ | ✅ |
| `AUTH_SECRET` | `GyrwL3TBTZFBLx3Z09aAtSB76ulU1+EMRIT5ncCdRVI=` | ✅ | ✅ |

5. 点击 **"Save"**（保存）

---

## 第六步：发布应用（可选）

如果你的应用要公开给所有用户（不仅是测试用户）：

1. 回到 **OAuth consent screen** 页面
2. 在 **"Publishing status"** 部分，点击 **"PUBLISH APP"**（发布应用）
3. 确认发布

⚠️ **注意**：发布后，任何 Google 用户都可以使用你的应用登录。

---

## 第七步：验证配置

### 测试登录流程：

1. 访问：https://ybbtool.com
2. 点击右上角 **"登录"** 按钮
3. 应该跳转到 Google 登录页面
4. 选择你的 Google 账号
5. 授权应用
6. 自动跳转回水印工具页面，显示你的头像和姓名

### 常见问题排查：

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| `redirect_uri_mismatch` | 重定向 URI 不匹配 | 检查 Google Cloud Console 中的 redirect URI 是否完全一致 |
| `access_denied` | 用户未添加到测试用户 | 在 OAuth 同意屏幕的 Test users 中添加你的账号 |
| `invalid_client` | Client ID 或 Secret 错误 | 检查 Cloudflare 环境变量是否正确复制 |
| 登录后无限循环 | Cookie 设置问题 | 检查 AUTH_SECRET 是否已配置 |

---

## 第八步：后续部署更新

每次部署新版本时，Cloudflare 会生成新的预览 URL（如 `https://abc123.watermark-tool-6ky.pages.dev`）。

### 选项 1：每次添加新 URL（推荐用于开发）
在 Google Cloud Console 中添加新的 preview URL 到：
- Authorized JavaScript origins
- Authorized redirect URIs

### 选项 2：仅使用主域名（推荐用于生产）
只配置主域名 `https://ybbtool.com`，预览版本不测试登录功能。

---

## 📋 完整配置清单

### Google Cloud Console
- [ ] 创建项目
- [ ] 配置 OAuth 同意屏幕
  - [ ] 应用名称：Watermark Tool
  - [ ] 授权域名：ybbtool.com
  - [ ] 添加测试用户
- [ ] 创建 OAuth 2.0 Client ID
  - [ ] 类型：Web application
  - [ ] Authorized JavaScript origins（3 个）
  - [ ] Authorized redirect URIs（3 个）

### Cloudflare Pages
- [ ] 配置环境变量（4 个）
  - [ ] GOOGLE_CLIENT_ID
  - [ ] GOOGLE_CLIENT_SECRET
  - [ ] GOOGLE_REDIRECT_URI
  - [ ] AUTH_SECRET

### 测试验证
- [ ] 点击登录按钮
- [ ] Google 授权页面正常显示
- [ ] 授权后成功跳转回页面
- [ ] 用户头像和姓名正常显示
- [ ] 退出登录功能正常

---

## 🔗 相关链接

- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **OAuth 同意屏幕**: https://console.cloud.google.com/apis/credentials/consent
- **Google OAuth 文档**: https://developers.google.com/identity/protocols/oauth2
- **Cloudflare Pages 环境变量**: https://dash.cloudflare.com/

---

配置完成后，刷新 https://ybbtool.com 页面即可测试登录功能！🎉
