-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,                    -- Google sub
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  last_login_at INTEGER,
  
  -- 账户类型
  subscription_type TEXT DEFAULT 'free',  -- free, pro, enterprise
  subscription_start INTEGER,
  subscription_end INTEGER,
  
  -- 配额管理
  daily_limit INTEGER DEFAULT 3,
  daily_used INTEGER DEFAULT 0,
  daily_reset_at INTEGER DEFAULT 0,
  
  -- API 密钥
  api_key TEXT UNIQUE,
  api_enabled INTEGER DEFAULT 0
);

-- 订单表（预留，暂不使用）
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_id TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  paid_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 使用记录表
CREATE TABLE IF NOT EXISTS usage_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  file_size INTEGER,
  result_size INTEGER,
  processing_time INTEGER,
  ip_address TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_usage_user ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_date ON usage_logs(created_at);
