# 🔑 Vercel 环境变量配置

## ⚠️ 必须配置的环境变量

在 Vercel Dashboard → Settings → Environment Variables → Add 中添加：

### 1. NEXTAUTH_SECRET（必需！最关键！）

**生成方法：**
```bash
openssl rand -hex 32
```

**示例输出：**
```
e4cfc757e019ebd5f20a93a5b8046af1815ca69ec8c6d46c6efe75764707a214
```

**配置：**
- Variable name: `NEXTAUTH_SECRET`
- Value: （粘贴上面生成的随机字符串）
- ✅ 勾选 **Production**
- ✅ 勾选 **Preview**
- ✅ 勾选 **Development**

**要求：**
- ✅ 必须是随机生成的长字符串
- ✅ 至少 32 个字符
- ❌ 不能是短字符串如 "123456"
- ❌ 不能缺失

---

### 2. GOOGLE_CLIENT_ID

- Variable name: `GOOGLE_CLIENT_ID`
- Value: （从 TOOLS.md 复制你的 Client ID）
- ✅ 勾选 **Production**
- ✅ 勾选 **Preview**
- ✅ 勾选 **Development**

---

### 3. GOOGLE_CLIENT_SECRET

- Variable name: `GOOGLE_CLIENT_SECRET`
- Value: （从 TOOLS.md 复制你的 Client Secret）
- ✅ 勾选 **Production**
- ✅ 勾选 **Preview**
- ✅ 勾选 **Development**

---

### 4. NEXTAUTH_URL（可选但推荐）

- Variable name: `NEXTAUTH_URL`
- Value: `https://ybbtool.com`（你的域名）
- ✅ 勾选 **Production**
- ✅ 勾选 **Preview**
- ✅ 勾选 **Development**

**要求：**
- ✅ 必须是 HTTPS（线上环境）
- ✅ 不能带路径（如 /api/auth）
- ❌ 不能是 HTTP（除了 localhost）

---

## 📋 配置检查清单

- [ ] NEXTAUTH_SECRET 已配置（使用 openssl 生成）
- [ ] NEXTAUTH_SECRET 长度至少 32 字符
- [ ] GOOGLE_CLIENT_ID 已配置
- [ ] GOOGLE_CLIENT_SECRET 已配置
- [ ] 所有变量都勾选了 Production/Preview/Development

---

## ⚠️ 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| 500 Internal Server Error | NEXTAUTH_SECRET 未配置或太短 | 使用 `openssl rand -hex 32` 重新生成 |
| OAuth 失败 | GOOGLE_CLIENT_ID 错误 | 从 Google Cloud Console 重新复制 |
| redirect_uri_mismatch | Google 控制台未添加 Vercel 域名 | 在 Google Cloud Console 添加域名 |
| 环境变量为空 | 未勾选 Production/Preview/Development | 重新编辑变量，勾选所有环境 |

---

**配置完成后，重新部署项目即可！**
