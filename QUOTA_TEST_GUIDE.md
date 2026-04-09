# 🧪 配额扣减修复测试指南

## ✅ 已完成的修改

### 1. 代码修改
- ✅ `frontend/app/api/add-watermark/route.ts` - 添加配额扣减返回值检查和详细日志
- ✅ `frontend/lib/db.ts` - 移除 WHERE 条件中的配额检查，添加错误处理
- ✅ 代码已提交并推送到 GitHub

### 2. 自动部署
- ✅ GitHub Actions 正在自动部署到 Cloudflare Pages
- 🕐 预计部署时间：2-5 分钟

---

## 📋 测试步骤

### 步骤 1：等待部署完成

访问 GitHub Actions 查看部署状态：
https://github.com/ybbcn/watermark-tool/actions

或者访问 Cloudflare Pages 查看部署：
https://dash.cloudflare.com/?to=/:account/workers-and-pages/watermark-tool/overview

### 步骤 2：登录并测试水印功能

1. 访问 https://ybbtool.com
2. 点击 **登录** 按钮
3. 使用你的 Google 账户登录
4. 上传一张测试图片添加水印

### 步骤 3：查看日志验证配额扣减

#### 方法 A：Cloudflare Dashboard 查看日志

1. 访问 https://dash.cloudflare.com/?to=/:account/workers-and-pages/watermark-tool/overview
2. 点击左侧 **Deployments**
3. 点击最新的部署
4. 点击 **Logs** 标签
5. 搜索以下关键词：
   - `🔐 [Watermark] Quota check` - 配额检查日志
   - `✅ [Watermark] Quota consumed` - 配额扣减成功
   - `⚠️ [Watermark] Quota NOT consumed` - 配额扣减失败（可能已达限制）

#### 方法 B：使用 Wrangler CLI 查询数据库

```bash
# 安装 wrangler（如果未安装）
npm install -g wrangler

# 查询你的用户配额
wrangler d1 execute watermark-tool-db --command "SELECT id, email, daily_limit, daily_used, daily_reset_at FROM users WHERE email = '你的邮箱'"
```

**预期结果**：
- `daily_used` 应该比使用前增加 1
- 每次调用 `/api/add-watermark` 后，`daily_used` 应该递增

### 步骤 4：测试配额限制

1. 连续使用水印功能多次（免费用户每日限制 3 次）
2. 第 4 次使用时应该收到错误提示：
   ```json
   {
     "error": "Quota exceeded",
     "message": "今日配额已用完，请明天再来或升级 Pro",
     "remaining": 0,
     "limit": 3
   }
   ```

---

## 🔍 问题排查

### 如果配额仍然没有扣减

1. **检查日志中是否有错误信息**
   ```
   ❌ [Watermark] Failed to consume quota: ...
   ```

2. **检查数据库连接**
   ```bash
   wrangler d1 execute watermark-tool-db --command ".schema users"
   ```

3. **检查用户是否存在**
   ```bash
   wrangler d1 execute watermark-tool-db --command "SELECT * FROM users WHERE email = '你的邮箱'"
   ```

4. **手动测试配额扣减 SQL**
   ```bash
   wrangler d1 execute watermark-tool-db --command "UPDATE users SET daily_used = daily_used + 1 WHERE id = '你的用户 ID'"
   ```

### 如果看不到日志

Cloudflare Pages 的日志可能需要几分钟才能显示。如果看不到：
1. 等待 5-10 分钟
2. 或者重新部署一次（push 一个空 commit）

---

## 📊 修改总结

| 文件 | 修改内容 |
|------|----------|
| `route.ts` | 添加配额扣减返回值检查，增加详细日志 |
| `db.ts` | 移除 WHERE 条件中的 `daily_used < daily_limit`，添加 `updated_at` 更新 |
| `test-quota.js` | 新增测试脚本 |
| `QUOTA_TEST_GUIDE.md` | 新增测试指南（本文件） |

---

## 🎯 下一步

如果测试通过：
- ✅ 配额扣减功能正常工作
- ✅ 日志记录完整
- ✅ 可以继续使用或添加其他功能

如果测试失败：
- 📝 将错误日志发给我
- 🔧 我会继续帮你调试

---

**🥜 花生提示**：部署完成后记得测试并反馈结果哦！
