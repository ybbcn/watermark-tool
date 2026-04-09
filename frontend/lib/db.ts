/**
 * D1 数据库工具 - Cloudflare Pages Edge Runtime 兼容
 */

export interface Env {
  DB: any;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  subscription_type: 'free' | 'pro' | 'enterprise';
  daily_limit: number;
  daily_used: number;
  daily_reset_at: number;
  api_key?: string;
  api_enabled: number;
}

export interface UsageLog {
  id: number;
  user_id: string;
  operation: string;
  created_at: number;
  file_size?: number;
  result_size?: number;
  processing_time?: number;
}

export interface UserStats {
  today: number;
  month: number;
  total: number;
}

/**
 * 获取用户信息
 */
export async function getUser(db: any, userId: string): Promise<User | null> {
  const { results } = await db.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(userId).all();
  return (results[0] as User) || null;
}

/**
 * 通过邮箱获取用户
 */
export async function getUserByEmail(db: any, email: string): Promise<User | null> {
  const { results } = await db.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).all();
  return (results[0] as User) || null;
}

/**
 * 创建或更新用户（登录时调用）
 */
export async function upsertUser(db: any, user: {
  id: string;
  email: string;
  name: string;
  picture?: string;
}) {
  const now = Math.floor(Date.now() / 1000);
  
  await db.prepare(`
    INSERT INTO users (id, email, name, picture, last_login_at, daily_reset_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      picture = excluded.picture,
      last_login_at = excluded.last_login_at,
      updated_at = strftime('%s', 'now')
  `).bind(user.id, user.email, user.name, user.picture, now, now).run();
}

/**
 * 更新用户配额
 */
export async function updateUserQuota(db: any, userId: string, used: number) {
  await db.prepare(`
    UPDATE users SET daily_used = ?, updated_at = strftime('%s', 'now')
    WHERE id = ?
  `).bind(used, userId).run();
}

/**
 * 消耗配额
 */
export async function consumeQuota(db: any, userId: string): Promise<boolean> {
  try {
    const result = await db.prepare(`
      UPDATE users SET daily_used = daily_used + 1, updated_at = strftime('%s', 'now')
      WHERE id = ?
    `).bind(userId).run();
    
    const success = result.success && result.meta.changes > 0;
    
    if (!success) {
      console.error("❌ [DB] consumeQuota failed for user", userId, "- changes:", result.meta.changes);
    }
    
    return success;
  } catch (error) {
    console.error("❌ [DB] consumeQuota error for user", userId, ":", error);
    throw error;
  }
}

/**
 * 记录使用日志
 */
export async function logUsage(
  db: any,
  userId: string,
  operation: string,
  fileSize?: number,
  resultSize?: number,
  processingTime?: number
) {
  await db.prepare(`
    INSERT INTO usage_logs (user_id, operation, file_size, result_size, processing_time)
    VALUES (?, ?, ?, ?, ?)
  `).bind(userId, operation, fileSize, resultSize, processingTime).run();
  
  // 更新配额
  const now = Math.floor(Date.now() / 1000);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = Math.floor(today.getTime() / 1000);
  
  const { results } = await db.prepare(`
    SELECT COUNT(*) as count FROM usage_logs 
    WHERE user_id = ? AND created_at >= ?
  `).bind(userId, todayStart).first() as { results: [{ count: number }] };
  
  await updateUserQuota(db, userId, results[0].count);
}

/**
 * 获取用户统计
 */
export async function getUserStats(db: any, userId: string): Promise<UserStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = Math.floor(today.getTime() / 1000);
  
  const month = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStart = Math.floor(month.getTime() / 1000);
  
  const [todayResult, monthResult, totalResult] = await Promise.all([
    db.prepare(`SELECT COUNT(*) as c FROM usage_logs WHERE user_id = ? AND created_at >= ?`)
      .bind(userId, todayStart).first() as Promise<{ c: number }>,
    db.prepare(`SELECT COUNT(*) as c FROM usage_logs WHERE user_id = ? AND created_at >= ?`)
      .bind(userId, monthStart).first() as Promise<{ c: number }>,
    db.prepare(`SELECT COUNT(*) as c FROM usage_logs WHERE user_id = ?`)
      .bind(userId).first() as Promise<{ c: number }>,
  ]);
  
  return {
    today: todayResult.c,
    month: monthResult.c,
    total: totalResult.c,
  };
}

/**
 * 获取最近使用记录
 */
export async function getRecentUsage(db: any, userId: string, limit = 10): Promise<UsageLog[]> {
  const { results } = await db.prepare(`
    SELECT * FROM usage_logs 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT ?
  `).bind(userId, limit).all();
  
  return results as UsageLog[];
}

/**
 * 检查并重置每日配额
 */
export async function checkAndResetQuota(db: any, userId: string): Promise<User | null> {
  const user = await getUser(db, userId);
  if (!user) return null;

  const now = Math.floor(Date.now() / 1000);
  const daySeconds = 24 * 60 * 60;
  
  // 检查是否需要重置配额
  if (now - user.daily_reset_at >= daySeconds) {
    await db.prepare(`
      UPDATE users SET daily_used = 0, daily_reset_at = ?, updated_at = strftime('%s', 'now')
      WHERE id = ?
    `).bind(now, userId).run();
    
    user.daily_used = 0;
    user.daily_reset_at = now;
  }
  
  return user;
}

/**
 * 获取订阅限制
 */
export function getSubscriptionLimits(type: string) {
  const limits = {
    free: {
      dailyLimit: 3,
      maxSize: 2 * 1024 * 1024,      // 2MB
      batchLimit: 1,
      apiAccess: false,
      watermarkRemoval: false,
      hdExport: false,
    },
    pro: {
      dailyLimit: 100,
      maxSize: 20 * 1024 * 1024,     // 20MB
      batchLimit: 10,
      apiAccess: true,
      watermarkRemoval: true,
      hdExport: true,
    },
    enterprise: {
      dailyLimit: 999999,
      maxSize: 100 * 1024 * 1024,    // 100MB
      batchLimit: 999999,
      apiAccess: true,
      watermarkRemoval: true,
      hdExport: true,
    },
  };
  
  return limits[type as keyof typeof limits] || limits.free;
}
