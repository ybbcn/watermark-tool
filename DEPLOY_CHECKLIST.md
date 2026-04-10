# 部署验证清单 ✅

## 📦 代码提交状态

```
✅ 本地提交完成
✅ 推送到远程仓库 (GitHub)
✅ 触发 Cloudflare Pages 自动部署
```

**最新 Commit**: `6262cea` - docs: 添加完整测试报告

---

## 🚀 自动部署流程

1. **GitHub Push** → 触发 Cloudflare Pages Webhook
2. **Cloudflare Pages** → 开始构建
3. **Next.js Build** → 编译前端代码
4. **Deploy** → 部署到生产环境
5. **完成** → https://ybbtool.com 更新

---

## 📋 部署验证步骤

### 1️⃣ 检查部署状态

访问：https://dash.cloudflare.com/
- 选择账户 → Workers & Pages → watermark-tool
- 查看 **Deployments** 标签
- 确认最新部署状态：
  - ⏳ Building - 构建中
  - ✅ Success - 部署成功
  - ❌ Failed - 部署失败

**预计部署时间**: 2-5 分钟

---

### 2️⃣ 验证生产环境

#### ✅ 测试 A: 配额显示刷新

**步骤**:
1. 访问 https://ybbtool.com
2. 登录你的账户
3. 记录当前配额显示（例如：0/3）
4. 上传一张图片并处理
5. 观察右上角用户菜单中的配额

**预期结果**:
- ✅ 处理完成后配额立即更新（例如：1/3）
- ✅ 无需刷新页面

---

#### ✅ 测试 B: 配额超限保护

**步骤**:
1. 连续处理 3 张图片（或用尽当日配额）
2. 尝试处理第 4 张图片

**预期结果**:
- ✅ 第 4 次请求被拒绝
- ✅ 显示错误提示："今日配额已用完"
- ✅ 配额显示保持 3/3

---

#### ✅ 测试 C: 并发保护

**步骤**:
1. 使用浏览器开发者工具 (F12)
2. 打开 Network 标签
3. 快速连续点击"处理"按钮 5 次
4. 观察请求结果

**预期结果**:
- ✅ 只有 3 个请求成功（200 OK）
- ✅ 其余请求被拒绝（403 Forbidden）
- ✅ 数据库 `daily_used` 不超过 3

---

#### ✅ 测试 D: 自然日重置（需等待）

**步骤**:
1. 在 23:59 分配额用尽
2. 等到 00:01 分（第二天）
3. 刷新页面

**预期结果**:
- ✅ 配额重置为 0/3
- ✅ 可以继续使用

---

### 3️⃣ 数据库验证

**命令**:
```bash
cd /root/.openclaw/workspace/watermark-tool/frontend

# 需要先配置 Cloudflare API Token
export CLOUDFLARE_API_TOKEN="your_token_here"

# 查看用户配额状态
wrangler d1 execute watermark-tool-db --remote \
  --command "SELECT id, email, daily_limit, daily_used, daily_reset_at FROM users WHERE email = '你的邮箱'"
```

**预期结果**:
- `daily_used` ≤ `daily_limit`
- `daily_reset_at` 是今天的 UTC 0 点时间戳

---

## 📊 监控指标

### Cloudflare Pages 部署日志

访问：https://dash.cloudflare.com/ → watermark-tool → Deployments → 最新部署

**检查项**:
- ✅ Build 成功
- ✅ 无错误日志
- ✅ 部署时间 < 5 分钟

### 错误监控

处理图片时观察浏览器控制台：

**正常日志**:
```
📥 [Watermark] File: image.jpg 1234567
📊 [Quota] After check&consume: 2/3 remaining, allowed=true
✅ [Quota] Consumed for user ou_xxx
⚠️ [Watermark] Processing not available in Edge Runtime, returning original
```

**错误日志**（配额用尽）:
```
📊 [Quota] After check&consume: 0/3 remaining, allowed=false
❌ [Quota] Exceeded for user ou_xxx
```

---

## 🔄 回滚方案

如果部署后出现问题：

### 方法 1: Cloudflare Dashboard 回滚
1. 访问 https://dash.cloudflare.com/
2. Workers & Pages → watermark-tool → Deployments
3. 找到上一个成功部署
4. 点击 **"Rollback"**

### 方法 2: Git 回滚
```bash
cd /root/.openclaw/workspace/watermark-tool

# 回滚到上一个版本
git reset --hard 96f8c36
git push --force origin master
```

---

## 📝 测试记录表

| 测试项 | 测试时间 | 测试结果 | 备注 |
|--------|----------|----------|------|
| 部署状态检查 | _待填写_ | ⏳ 待测试 | |
| 配额显示刷新 | _待填写_ | ⏳ 待测试 | |
| 配额超限保护 | _待填写_ | ⏳ 待测试 | |
| 并发保护 | _待填写_ | ⏳ 待测试 | |
| 自然日重置 | _待填写_ | ⏳ 待测试 | 需等待跨天 |
| 数据库验证 | _待填写_ | ⏳ 待测试 | 需 API Token |

---

## 🎯 成功标准

所有以下条件满足时，修复视为成功：

- [x] 代码已推送到远程仓库
- [ ] 部署成功（Cloudflare Pages 显示 ✅）
- [ ] 配额显示刷新正常
- [ ] 配额超限保护正常
- [ ] 并发请求保护正常
- [ ] 无新增错误日志
- [ ] 用户反馈问题解决

---

## 📞 联系方式

如遇问题，请检查：
1. Cloudflare Pages 部署日志
2. 浏览器控制台错误
3. D1 数据库日志

**修复人员**: 花生 🥜  
**修复时间**: 2026-04-10  
**测试报告**: `TEST_REPORT.md`  
**修复文档**: `QUOTA_DISPLAY_FIX.md`
