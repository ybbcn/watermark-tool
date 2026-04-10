-- 添加配额相关字段到 users 表
-- 如果字段已存在则跳过

-- 添加 subscription_type 字段
ALTER TABLE users ADD COLUMN subscription_type TEXT DEFAULT 'free';

-- 添加 daily_limit 字段
ALTER TABLE users ADD COLUMN daily_limit INTEGER DEFAULT 3;

-- 添加 daily_used 字段
ALTER TABLE users ADD COLUMN daily_used INTEGER DEFAULT 0;

-- 添加 daily_reset_at 字段
ALTER TABLE users ADD COLUMN daily_reset_at INTEGER DEFAULT 0;

-- 添加 last_login_at 字段
ALTER TABLE users ADD COLUMN last_login_at INTEGER DEFAULT 0;

-- 添加 api_key 字段
ALTER TABLE users ADD COLUMN api_key TEXT DEFAULT NULL;

-- 添加 api_enabled 字段
ALTER TABLE users ADD COLUMN api_enabled INTEGER DEFAULT 0;

-- 重置所有现有用户的配额
UPDATE users SET 
  daily_used = 0,
  daily_reset_at = strftime('%s', 'now'),
  subscription_type = 'free',
  daily_limit = 3
WHERE email IS NOT NULL;
