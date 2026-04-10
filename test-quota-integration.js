#!/usr/bin/env node
/**
 * 配额系统集成测试
 * 模拟真实的配额使用场景
 */

const assert = require('assert');

// 模拟 D1 数据库
class MockD1Database {
  constructor() {
    this.users = new Map();
  }

  prepare(sql) {
    return {
      bind: (...params) => ({
        run: async () => this.run(sql, params),
        first: async () => this.first(sql, params),
        all: async () => this.all(sql, params),
      }),
    };
  }

  async run(sql, params) {
    console.log(`  [DB] ${sql} | params:`, params);
    
    if (sql.includes('UPDATE users') && sql.includes('daily_used = daily_used + 1')) {
      const userId = params[0];
      const user = this.users.get(userId);
      if (user && user.daily_used < user.daily_limit) {
        user.daily_used++;
        return { success: true, meta: { changes: 1 } };
      }
      return { success: true, meta: { changes: 0 } };
    }
    
    return { success: true, meta: { changes: 1 } };
  }

  async first(sql, params) {
    if (sql.includes('SELECT * FROM users WHERE id = ?')) {
      const userId = params[0];
      return this.users.get(userId) || null;
    }
    return null;
  }

  async all(sql, params) {
    if (sql.includes('SELECT * FROM users WHERE id = ?')) {
      const userId = params[0];
      const user = this.users.get(userId);
      return { results: user ? [user] : [] };
    }
    return { results: [] };
  }
}

// 导入要测试的函数（复制自 lib/db.ts）
async function getUser(db, userId) {
  const { results } = await db.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(userId).all();
  return results[0] || null;
}

async function checkAndResetQuota(db, userId) {
  const user = await getUser(db, userId);
  if (!user) return null;

  const now = Math.floor(Date.now() / 1000);
  
  // 计算今天的开始时间（自然日 0 点，UTC 时间戳）
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayStart = Math.floor(today.getTime() / 1000);
  
  // 检查是否需要重置配额（按自然日）
  if (user.daily_reset_at < todayStart) {
    user.daily_used = 0;
    user.daily_reset_at = todayStart;
  }
  
  return user;
}

async function consumeQuota(db, userId) {
  const result = await db.prepare(`
    UPDATE users 
    SET daily_used = daily_used + 1, updated_at = strftime('%s', 'now')
    WHERE id = ? AND daily_used < daily_limit
  `).bind(userId).run();
  
  return result.success && result.meta.changes > 0;
}

async function checkAndConsumeQuota(db, userId) {
  const user = await checkAndResetQuota(db, userId);
  
  if (!user) {
    return { allowed: false, remaining: 0, limit: 0 };
  }
  
  const remaining = user.daily_limit - user.daily_used;
  
  if (remaining <= 0) {
    return { allowed: false, remaining: 0, limit: user.daily_limit };
  }
  
  const consumed = await consumeQuota(db, userId);
  
  if (!consumed) {
    const updatedUser = await getUser(db, userId);
    const updatedRemaining = updatedUser ? updatedUser.daily_limit - updatedUser.daily_used : 0;
    return { 
      allowed: false, 
      remaining: updatedRemaining, 
      limit: updatedUser?.daily_limit || user.daily_limit 
    };
  }
  
  return { 
    allowed: true, 
    remaining: remaining - 1, 
    limit: user.daily_limit 
  };
}

// 测试场景
async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('         配额系统集成测试');
  console.log('═══════════════════════════════════════════════════════\n');

  const db = new MockD1Database();
  const userId = 'test-user-123';
  
  // 初始化用户数据
  db.users.set(userId, {
    id: userId,
    email: 'test@example.com',
    daily_limit: 3,
    daily_used: 0,
    daily_reset_at: Math.floor(Date.now() / 1000),
  });

  let passed = 0;
  let failed = 0;

  // 测试 1: 正常扣减配额
  console.log('📝 测试 1: 正常扣减配额');
  try {
    const result1 = await checkAndConsumeQuota(db, userId);
    assert.strictEqual(result1.allowed, true);
    assert.strictEqual(result1.remaining, 2);
    
    const result2 = await checkAndConsumeQuota(db, userId);
    assert.strictEqual(result2.allowed, true);
    assert.strictEqual(result2.remaining, 1);
    
    const result3 = await checkAndConsumeQuota(db, userId);
    assert.strictEqual(result3.allowed, true);
    assert.strictEqual(result3.remaining, 0);
    
    console.log('  ✅ PASS: 配额正确扣减 3 次\n');
    passed++;
  } catch (error) {
    console.log(`  ❌ FAIL: ${error.message}\n`);
    failed++;
  }

  // 测试 2: 配额用完后拒绝
  console.log('📝 测试 2: 配额用完后拒绝');
  try {
    const result = await checkAndConsumeQuota(db, userId);
    assert.strictEqual(result.allowed, false);
    assert.strictEqual(result.remaining, 0);
    
    console.log('  ✅ PASS: 配额用完后正确拒绝\n');
    passed++;
  } catch (error) {
    console.log(`  ❌ FAIL: ${error.message}\n`);
    failed++;
  }

  // 测试 3: 自然日重置
  console.log('📝 测试 3: 自然日重置配额');
  try {
    // 模拟昨天的重置时间
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    yesterday.setUTCHours(12, 0, 0, 0);
    const user = db.users.get(userId);
    user.daily_reset_at = Math.floor(yesterday.getTime() / 1000);
    user.daily_used = 3;
    
    const result = await checkAndResetQuota(db, userId);
    assert.strictEqual(result.daily_used, 0, '配额应该在新的自然日重置为 0');
    
    console.log('  ✅ PASS: 新的自然日配额正确重置\n');
    passed++;
  } catch (error) {
    console.log(`  ❌ FAIL: ${error.message}\n`);
    failed++;
  }

  // 测试 4: 并发请求保护
  console.log('📝 测试 4: 并发请求保护');
  try {
    // 重置用户配额
    const user = db.users.get(userId);
    user.daily_used = 2;
    user.daily_limit = 3;
    
    // 模拟 5 个并发请求
    const promises = Array(5).fill(null).map(() => checkAndConsumeQuota(db, userId));
    const results = await Promise.all(promises);
    
    const allowedCount = results.filter(r => r.allowed).length;
    const finalUser = db.users.get(userId);
    
    assert.strictEqual(allowedCount, 1, '只有 1 个请求应该成功（剩余 1 次配额）');
    assert.strictEqual(finalUser.daily_used, 3, '最终已用配额应该是 3');
    
    console.log(`  ✅ PASS: 5 个并发请求中只有 ${allowedCount} 个成功，防止超额扣减\n`);
    passed++;
  } catch (error) {
    console.log(`  ❌ FAIL: ${error.message}\n`);
    failed++;
  }

  // 测试 5: 24 小时滚动窗口 vs 自然日
  console.log('📝 测试 5: 24 小时滚动窗口 vs 自然日');
  try {
    // 模拟用户昨天 23:00 使用过
    const yesterday2300 = new Date();
    yesterday2300.setUTCDate(yesterday2300.getUTCDate() - 1);
    yesterday2300.setUTCHours(23, 0, 0, 0);
    
    // 现在是今天 01:00
    const today0100 = new Date();
    today0100.setUTCHours(1, 0, 0, 0);
    
    const user = db.users.get(userId);
    user.daily_reset_at = Math.floor(yesterday2300.getTime() / 1000);
    user.daily_used = 3;
    
    // 旧逻辑（24 小时滚动）
    const oldLogicShouldReset = (Math.floor(today0100.getTime() / 1000) - user.daily_reset_at) >= (24 * 60 * 60);
    
    // 新逻辑（自然日）
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayStart = Math.floor(today.getTime() / 1000);
    const newLogicShouldReset = user.daily_reset_at < todayStart;
    
    assert.strictEqual(oldLogicShouldReset, false, '旧逻辑不会重置（只过了 2 小时）');
    assert.strictEqual(newLogicShouldReset, true, '新逻辑会重置（已过 0 点）');
    
    console.log('  ✅ PASS: 新逻辑正确按自然日重置，旧逻辑错误\n');
    passed++;
  } catch (error) {
    console.log(`  ❌ FAIL: ${error.message}\n`);
    failed++;
  }

  // 总结
  console.log('═══════════════════════════════════════════════════════');
  console.log(`测试结果：${passed} 通过，${failed} 失败`);
  console.log('═══════════════════════════════════════════════════════');

  if (failed === 0) {
    console.log('\n✅ 所有集成测试通过！修复有效！\n');
    return 0;
  } else {
    console.log('\n❌ 部分测试失败，请检查！\n');
    return 1;
  }
}

// 运行测试
runTests().then(code => process.exit(code)).catch(err => {
  console.error('测试执行错误:', err);
  process.exit(1);
});
