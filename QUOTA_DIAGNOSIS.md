# 🔍 配额问题深度诊断

## 当前状态

### 数据库 ✅
```sql
id: 118745016780-uh7p0pcumqmlba4juhu36in3e009vkk3
email: yanxuebb@gmail.com
daily_limit: 999
daily_used: 0
subscription_type: free
```

### 用户反馈 ❌
```json
{
  "error": "Quota exceeded",
  "message": "今日配额已用完"
}
```

## 🔎 问题分析

### 可能的原因

#### 1. Session 用户 ID 不匹配
Google OAuth 返回的用户 ID 格式可能是：
- `userInfo.sub` = `118745016780-uh7p0pcumqmlba4juhu36in3e009vkk3` ✅
- 或其他格式 ❌

#### 2. `checkAndResetQuota` 返回 null
如果数据库查询失败，函数返回 null，导致配额检查失败。

#### 3. `consumeQuota` 的 SQL 条件问题
```sql
UPDATE users 
SET daily_used = daily_used + 1 
WHERE id = ? AND daily_used < daily_limit
```
如果 `daily_used` 字段不存在或类型不匹配，会导致更新失败。

#### 4. Edge Runtime 环境问题
Cloudflare Pages 的 Edge Runtime 可能有特殊的 SQLite 语法要求。

## 🧪 诊断步骤

### 步骤 1: 检查 Session 中的用户 ID
需要用户提供登录后的 Session Cookie，然后调用：
```bash
curl "https://ybbtool.com/api/auth/session" -H "Cookie: session=XXX"
```

### 步骤 2: 检查数据库字段类型
```sql
PRAGMA table_info(users);
```

### 步骤 3: 手动测试 SQL
```sql
-- 测试查询
SELECT * FROM users WHERE id = '118745016780-uh7p0pcumqmlba4juhu36in3e009vkk3';

-- 测试更新
UPDATE users SET daily_used = daily_used + 1 
WHERE id = '118745016780-uh7p0pcumqmlba4juhu36in3e009vkk3' AND daily_used < daily_limit;

-- 验证结果
SELECT daily_used FROM users WHERE id = '118745016780-uh7p0pcumqmlba4juhu36in3e009vkk3';
```

### 步骤 4: 查看 Cloudflare Logs
访问：https://dash.cloudflare.com/ → Workers & Pages → watermark-tool → Deployments → 最新部署 → Logs

搜索关键词：
- `Quota`
- `checkAndConsumeQuota`
- `Exceeded`

## 🔧 临时解决方案

### 方案 A: 完全绕过配额检查
修改 `app/api/add-watermark/route.ts`：
```typescript
// 注释掉配额检查
/*
if (userId) {
  const result = await checkAndConsumeQuota(db, userId);
  if (!result.allowed) {
    return NextResponse.json({ error: "Quota exceeded" }, { status: 403 });
  }
}
*/
```

### 方案 B: 简化配额检查
修改 `lib/db.ts` 中的 `checkAndConsumeQuota`：
```typescript
export async function checkAndConsumeQuota(db: any, userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
}> {
  // 直接查询用户
  const { results } = await db.prepare(
    'SELECT daily_limit, daily_used FROM users WHERE id = ?'
  ).bind(userId).all();
  
  const user = results[0];
  
  if (!user) {
    console.warn(`⚠️ User not found: ${userId}`);
    // 用户不存在，允许使用（不限制）
    return { allowed: true, remaining: 999, limit: 999 };
  }
  
  const remaining = user.daily_limit - user.daily_used;
  
  if (remaining <= 0) {
    return { allowed: false, remaining: 0, limit: user.daily_limit };
  }
  
  // 扣减配额
  await db.prepare(`
    UPDATE users SET daily_used = daily_used + 1 WHERE id = ?
  `).bind(userId).run();
  
  return { allowed: true, remaining: remaining - 1, limit: user.daily_limit };
}
```

## 📋 下一步行动

1. **获取 Session Cookie** - 从浏览器复制
2. **测试 Session API** - 确认用户 ID
3. **查看部署日志** - 找出错误原因
4. **应用临时修复** - 绕过或简化配额检查

---

**更新时间**: 2026-04-10 15:45
**状态**: 诊断中
