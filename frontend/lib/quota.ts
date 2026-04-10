/**
 * 配额管理工具
 */

import { getUser, checkAndResetQuota, getSubscriptionLimits } from "./db";

export interface QuotaCheck {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt?: number;
  upgradeRequired?: boolean;
  subscriptionType: string;
}

/**
 * 检查用户配额
 */
export async function checkQuota(
  db: any,
  userId: string
): Promise<QuotaCheck> {
  const user = await checkAndResetQuota(db, userId);
  
  if (!user) {
    return { 
      allowed: false, 
      remaining: 0, 
      limit: 0,
      subscriptionType: 'free'
    };
  }

  const remaining = user.daily_limit - user.daily_used;
  const resetAt = user.daily_reset_at + (24 * 60 * 60);

  return {
    allowed: remaining > 0,
    remaining,
    limit: user.daily_limit,
    resetAt,
    upgradeRequired: remaining <= 0,
    subscriptionType: user.subscription_type,
  };
}

/**
 * 检查未登录用户配额（基于 IP）
 * 简化版本：使用 localStorage 在客户端实现
 */
export function checkAnonymousQuota(): { allowed: boolean; remaining: number; limit: number } {
  if (typeof window === 'undefined') {
    return { allowed: true, remaining: 3, limit: 3 };
  }
  
  const today = new Date().toDateString();
  const stored = localStorage.getItem('anonymous_quota');
  
  if (!stored) {
    localStorage.setItem('anonymous_quota', JSON.stringify({ date: today, used: 0 }));
    return { allowed: true, remaining: 3, limit: 3 };
  }
  
  const { date, used } = JSON.parse(stored);
  
  if (date !== today) {
    localStorage.setItem('anonymous_quota', JSON.stringify({ date: today, used: 0 }));
    return { allowed: true, remaining: 3, limit: 3 };
  }
  
  const remaining = 3 - used;
  return { 
    allowed: remaining > 0, 
    remaining, 
    limit: 3 
  };
}

/**
 * 消耗未登录用户配额
 */
export function consumeAnonymousQuota(): void {
  if (typeof window === 'undefined') return;
  
  const today = new Date().toDateString();
  const stored = localStorage.getItem('anonymous_quota');
  
  if (!stored) {
    localStorage.setItem('anonymous_quota', JSON.stringify({ date: today, used: 1 }));
    return;
  }
  
  const { date, used } = JSON.parse(stored);
  
  if (date === today) {
    localStorage.setItem('anonymous_quota', JSON.stringify({ date, used: used + 1 }));
  }
}

/**
 * 获取订阅限制
 */
export { getSubscriptionLimits };

/**
 * 消耗配额（从 db.ts 重新导出）
 */
export { consumeQuota, checkAndConsumeQuota } from "./db";
