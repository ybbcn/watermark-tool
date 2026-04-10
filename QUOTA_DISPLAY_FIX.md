# 配额显示不一致问题修复报告

## 📋 问题描述

用户反馈：水印项目今日可用配额显示还有 3 次，但点击处理图片时提示"配额已用完"。

## 🔍 根本原因

经过代码分析，发现了三个主要问题：

### 问题 1：时区不一致（最严重）

**位置**: `lib/db.ts` - `checkAndResetQuota` 函数

**原代码**:
```typescript
const daySeconds = 24 * 60 * 60;
if (now - user.daily_reset_at >= daySeconds) {
  // 重置配额
}
```

**问题**: 使用 24 小时滚动窗口重置，而非自然日（每天 0 点）重置。
- 例如：用户昨天 23:00 使用过，今天 01:00 查询时只过了 2 小时，配额不会重置
- 但前端显示可能按自然日计算，导致显示"剩余 3 次"，实际数据库中还是旧数据

**修复**: 改为按 UTC 自然日 0 点重置
```typescript
const today = new Date();
today.setUTCHours(0, 0, 0, 0);
const todayStart = Math.floor(today.getTime() / 1000);

if (user.daily_reset_at < todayStart) {
  // 重置配额
}
```

---

### 问题 2：前端不刷新配额显示

**位置**: `components/UserMenu.tsx`

**原代码**:
```typescript
useEffect(() => {
  fetch("/api/auth/session")
    .then((res) => res.json())
    .then((data) => setUser(data.user));
}, []); // 空依赖数组，只在首次加载时获取
```

**问题**: 处理图片后配额已扣减，但前端显示的还是旧数据

**修复**: 
1. 添加事件监听机制，处理完成后触发刷新
2. 使用 `useCallback` 优化获取函数

```typescript
const fetchUser = useCallback(() => {
  fetch("/api/auth/session")
    .then((res) => res.json())
    .then((data) => setUser(data.user));
}, []);

useEffect(() => {
  fetchUser();
  
  const handleQuotaUpdate = () => fetchUser();
  window.addEventListener('quota-updated', handleQuotaUpdate);
  
  return () => {
    window.removeEventListener('quota-updated', handleQuotaUpdate);
  };
}, [fetchUser]);
```

---

### 问题 3：并发请求导致超额扣减

**位置**: `app/api/add-watermark/route.ts`

**原逻辑**:
```typescript
// 1. 检查配额
const quotaCheck = await checkQuota(db, userId);
if (!quotaCheck.allowed) return error;

// 2. 处理图片...

// 3. 扣减配额
await consumeQuota(db, userId);
```

**问题**: 检查和扣减之间有间隙，快速连续点击可能导致：
- 请求 A：检查通过（剩余 3 次）
- 请求 B：检查通过（剩余 3 次）
- 请求 A：扣减（变为 2 次）
- 请求 B：扣减（变为 1 次）
- 实际消耗 2 次，但用户只点击了 1 次有效请求

**修复**: 使用原子操作，检查并扣减合并为一步
```typescript
// 使用条件 UPDATE，只有未超限时才扣减
UPDATE users 
SET daily_used = daily_used + 1
WHERE id = ? AND daily_used < daily_limit
```

新增 `checkAndConsumeQuota` 函数：
```typescript
export async function checkAndConsumeQuota(db: any, userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
}> {
  const user = await checkAndResetQuota(db, userId);
  const remaining = user.daily_limit - user.daily_used;
  
  if (remaining <= 0) {
    return { allowed: false, remaining: 0, limit: user.daily_limit };
  }
  
  const consumed = await consumeQuota(db, userId); // 带条件检查
  
  if (!consumed) {
    // 扣减失败，返回最新配额
    const updatedUser = await getUser(db, userId);
    return { allowed: false, remaining: updatedUser.daily_limit - updatedUser.daily_used, ... };
  }
  
  return { allowed: true, remaining: remaining - 1, limit: user.daily_limit };
}
```

---

## ✅ 修改文件清单

| 文件 | 修改内容 |
|------|----------|
| `lib/db.ts` | 1. 修复 `checkAndResetQuota` 使用自然日重置<br>2. 改进 `consumeQuota` 添加条件检查<br>3. 新增 `checkAndConsumeQuota` 原子操作 |
| `lib/quota.ts` | 导出新的 `checkAndConsumeQuota` 函数 |
| `app/api/add-watermark/route.ts` | 使用原子操作 `checkAndConsumeQuota` 替代分开的检查和扣减 |
| `app/page.tsx` | 处理成功后/失败后触发 `quota-updated` 事件 |
| `components/UserMenu.tsx` | 监听 `quota-updated` 事件，自动刷新配额显示 |

---

## 🧪 测试建议

### 1. 测试自然日重置
```bash
# 查询当前用户配额状态
wrangler d1 execute watermark-tool-db --command \
  "SELECT id, email, daily_limit, daily_used, daily_reset_at FROM users WHERE email = '你的邮箱'"
```

- 在 23:59 分使用一次
- 等到 00:01 分，查看配额是否重置为 0

### 2. 测试前端刷新
1. 打开浏览器开发者工具
2. 处理一张图片
3. 观察右上角用户菜单中的配额是否立即更新

### 3. 测试并发保护
1. 快速连续点击处理按钮 5 次
2. 检查数据库 `daily_used` 是否只增加了实际成功的次数
3. 查看 Cloudflare Logs，确认没有超额扣减

---

## 📝 部署步骤

1. **提交代码**
```bash
cd /root/.openclaw/workspace/watermark-tool/frontend
git add .
git commit -m "fix: 修复配额显示不一致问题（自然日重置 + 原子操作 + 前端刷新）"
```

2. **部署到 Cloudflare Pages**
```bash
# 如果使用 Vercel
git push origin main

# 或者手动在 Cloudflare Dashboard 触发部署
```

3. **验证部署**
- 访问 https://ybbtool.com
- 登录后查看配额显示
- 处理图片后确认配额正确扣减和刷新

---

## 🎯 预期效果

修复后：
1. ✅ 每天 0 点（UTC）自动重置配额
2. ✅ 处理图片后前端立即刷新显示
3. ✅ 快速连续点击不会超额扣减
4. ✅ 配额显示与实际数据库一致

---

## 📌 后续优化建议

1. **添加配额刷新按钮**：在用户菜单中添加手动刷新按钮
2. **实时配额通知**：配额低于 20% 时主动提醒用户
3. **配额使用图表**：在个人中心展示每日/每月使用趋势
4. **时区支持**：根据用户时区调整重置时间（而非固定 UTC 0 点）

---

**修复时间**: 2026-04-10  
**修复人员**: 花生 🥜
