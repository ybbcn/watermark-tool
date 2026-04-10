# 配额逻辑完整测试报告

## 📋 问题现状

**用户**: yanxuebb@gmail.com  
**数据库状态**: daily_limit=999, daily_used=0  
**API 返回**: `{"error": "Quota exceeded", "message": "今日配额已用完"}`

## 🔍 问题排查

### 1. 数据库状态 ✅
```sql
SELECT id, email, daily_limit, daily_used FROM users WHERE email = 'yanxuebb@gmail.com';

结果:
id: 118745016780-uh7p0pcumqmlba4juhu36in3e009vkk3
email: yanxuebb@gmail.com
daily_limit: 999
daily_used: 0
```

✅ 数据库配额正确（0/999）

### 2. 代码版本检查 ⚠️

**问题**: Cloudflare Pages 部署可能还在使用旧代码

旧代码逻辑 (`lib/db.ts`):
```typescript
export async function checkQuota(db: any, userId: string): Promise<QuotaCheck> {
  const user = await checkAndResetQuota(db, userId);
  
  if (!user) {
    return { allowed: false, remaining: 0, limit: 0 };
  }

  const remaining = user.daily_limit - user.daily_used;
  
  return {
    allowed: remaining > 0,  // ← 如果 remaining > 0 则允许
    remaining,
    limit: user.daily_limit,
  };
}
```

**旧代码问题**:
1. `checkAndResetQuota` 可能返回 `null`（如果用户不存在）
2. 配额检查和扣减是分开的，存在并发问题

### 3. Session 用户 ID 检查

需要确认：
- Session 中的用户 ID 格式
- 是否与数据库中的 ID 匹配

## 🧪 测试步骤

### 测试 1: 检查 Session 中的用户 ID

```bash
curl -s "https://ybbtool.com/api/auth/session" \
  -H "Cookie: session=<从浏览器复制>"
```

预期输出:
```json
{
  "user": {
    "id": "118745016780-uh7p0pcumqmlba4juhu36in3e009vkk3",
    "email": "yanxuebb@gmail.com",
    ...
  }
}
```

### 测试 2: 检查配额 API 响应

```bash
curl -s "https://ybbtool.com/api/user/info" \
  -H "Cookie: session=<从浏览器复制>"
```

预期输出:
```json
{
  "user": {
    "daily_limit": 999,
    "daily_used": 0
  }
}
```

### 测试 3: 检查 add-watermark API 日志

访问 Cloudflare Dashboard → Workers & Pages → watermark-tool → Deployments → 最新部署 → Logs

查看日志中是否有:
- `📊 [Quota] After check&consume: X/999 remaining`
- `❌ [Quota] Exceeded for user XXX`

## 🔧 可能的原因

### 原因 1: 代码未部署 ✅ 最可能

**症状**: 数据库正确，但 API 返回错误  
**原因**: Cloudflare Pages 部署失败或使用旧代码  
**解决**: 等待部署完成或手动触发重新部署

### 原因 2: Session 用户 ID 不匹配

**症状**: 用户已登录，但配额检查失败  
**原因**: Session 中的用户 ID 与数据库中的 ID 格式不同  
**解决**: 确认用户 ID 格式一致

### 原因 3: 旧代码逻辑 bug

**症状**: `checkAndResetQuota` 返回 null  
**原因**: 旧代码中用户不存在时返回 null，导致配额检查失败  
**解决**: 确保用户记录存在

## ✅ 解决方案

### 方案 1: 等待部署完成（推荐）

当前部署 ID: `cc223dbf`  
状态：等待完成

### 方案 2: 临时绕过配额检查

修改 `app/api/add-watermark/route.ts`:
```typescript
// 临时注释配额检查
/*
if (userId) {
  const result = await checkAndConsumeQuota(db, userId);
  if (!result.allowed) {
    return NextResponse.json({ error: "Quota exceeded" }, { status: 403 });
  }
}
*/
```

### 方案 3: 强制刷新用户记录

```sql
-- 删除并重新创建用户记录
DELETE FROM users WHERE email = 'yanxuebb@gmail.com';
INSERT INTO users (id, email, name, subscription_type, daily_limit, daily_used, daily_reset_at)
VALUES ('118745016780-uh7p0pcumqmlba4juhu36in3e009vkk3', 'yanxuebb@gmail.com', '严雪', 'free', 999, 0, strftime('%s', 'now'));
```

## 📊 完整测试脚本

创建一个测试脚本来验证整个配额流程：

```javascript
// test-quota-full.js
const https = require('https');

const CONFIG = {
  baseUrl: 'https://ybbtool.com',
  email: 'yanxuebb@gmail.com',
};

async function testSession() {
  console.log('📝 测试 1: 检查 Session');
  // 需要用户提供 session cookie
}

async function testQuotaAPI() {
  console.log('📝 测试 2: 检查配额 API');
  // 调用 /api/user/info
}

async function testWatermark() {
  console.log('📝 测试 3: 测试水印处理');
  // 调用 /api/add-watermark
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('       配额完整测试');
  console.log('═══════════════════════════════════════\n');
  
  await testSession();
  await testQuotaAPI();
  await testWatermark();
}

main();
```

## 🎯 下一步行动

1. **检查部署状态**: 访问 Cloudflare Dashboard 查看部署是否完成
2. **获取 Session Cookie**: 从浏览器复制 session cookie 进行测试
3. **查看部署日志**: 检查配额检查的详细日志
4. **如果部署失败**: 手动重新触发部署

---

**更新时间**: 2026-04-10 15:15  
**状态**: 调查中
