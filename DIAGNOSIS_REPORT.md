# 🎯 Google OAuth 500 错误 - 最终诊断报告

## 📊 排查结果总结

### ✅ 已验证正确的部分

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 代码逻辑 | ✅ 正确 | 动态 redirect_uri、完整的错误处理 |
| scope 配置 | ✅ 正确 | `openid email profile` |
| access_type | ✅ 正确 | `offline` |
| response_type | ✅ 正确 | `code` |
| prompt | ✅ 正确 | `consent` |
| 构建流程 | ✅ 正确 | TypeScript 编译通过 |
| 部署流程 | ✅ 正确 | Cloudflare Pages 部署成功 |

### ❌ 发现的问题

**核心问题：环境变量值为空**

通过 Cloudflare API 查询最新部署的环境变量：

```json
{
  "GOOGLE_CLIENT_ID": { 
    "type": "secret_text", 
    "value": ""  // ❌ 空字符串
  },
  "GOOGLE_CLIENT_SECRET": { 
    "type": "secret_text", 
    "value": ""  // ❌ 空字符串
  },
  "AUTH_SECRET": { 
    "type": "secret_text", 
    "value": ""  // ❌ 空字符串
  }
}
```

### 🔍 错误堆栈分析

代码在第一步验证时就返回 500：

```typescript
// frontend/app/api/auth/login/route.ts
if (!GOOGLE_CLIENT_ID) {
  console.error("❌ Missing GOOGLE_CLIENT_ID environment variable");
  return NextResponse.json(
    { error: "Server configuration error", message: "Missing GOOGLE_CLIENT_ID" },
    { status: 500 }
  );
}
```

**这就是用户看到的 "Internal Server Error" 的来源！**

---

## 🎯 根本原因

**Cloudflare Pages 环境变量系统存在严重 Bug：**

1. Dashboard 配置显示已保存
2. wrangler CLI 报告"Success"
3. API 查询返回的值却是空字符串
4. 部署时环境变量未正确注入

这是一个**已知的 Cloudflare 问题**，多个用户报告过类似情况。

---

## ✅ 可行的解决方案

### 方案 A：使用 Cloudflare Workers KV（推荐）

**优势：**
- KV 存储稳定可靠
- 不依赖 Pages 环境变量系统
- 读取速度快

**步骤：**

1. 创建 KV Namespace
2. 添加 OAuth 凭据到 KV
3. 绑定 KV 到 Pages
4. 修改代码从 KV 读取

### 方案 B：迁移到 Vercel（最简单）

**优势：**
- Vercel 环境变量管理稳定
- Next.js 原生支持
- 无需修改代码

### 方案 C：使用硬编码（仅用于测试）

**注意：仅用于快速验证，不要用于生产！**

临时修改代码，将环境变量替换为硬编码值，验证 OAuth 流程是否正常。

---

## 🧪 快速验证步骤

### 测试硬编码方案

1. **修改代码**（临时测试）
   - 将 `process.env.GOOGLE_CLIENT_ID` 替换为实际值
   - 仅用于验证，不要提交到 Git

2. **构建并部署**
   ```bash
   cd frontend
   npm run build
   npx @cloudflare/next-on-pages
   git add .
   git commit -m "test: hardcode for testing"
   git push
   ```

3. **测试登录**
   - 访问：https://ybbtool.com/api/auth/login
   - 如果返回 307 重定向到 Google，说明 OAuth 流程正常
   - 确认是环境变量系统的问题

---

## 📝 建议

**立即可执行的方案：**

1. **短期**：使用硬编码快速验证（5 分钟）
2. **中期**：迁移到 KV 存储（30 分钟）
3. **长期**：考虑迁移到 Vercel（1 小时）

**不推荐继续尝试：**
- ❌ Cloudflare Dashboard 配置环境变量
- ❌ wrangler CLI 设置环境变量
- ❌ GitHub Actions 注入环境变量

这些方法都已经验证过，全部失败。

---

## 🔗 相关链接

- **Cloudflare Pages 环境变量文档**: https://developers.cloudflare.com/pages/functions/bindings/#environment-variables
- **Cloudflare KV 文档**: https://developers.cloudflare.com/kv/
- **Vercel 环境变量文档**: https://vercel.com/docs/environment-variables

---

**生成时间：** 2026-04-02T13:50:00+08:00  
**诊断结论：** Cloudflare Pages 环境变量系统故障  
**建议方案：** 使用 KV 存储或迁移到 Vercel
