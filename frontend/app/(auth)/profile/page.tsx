"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  subscription_type: 'free' | 'pro' | 'enterprise';
  daily_limit: number;
  daily_used: number;
}

interface UserStats {
  today: number;
  month: number;
  total: number;
}

interface UsageLog {
  id: number;
  operation: string;
  created_at: string;
  file_size?: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentUsage, setRecentUsage] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/info")
      .then((res) => {
        if (res.status === 401) {
          router.push("/");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setUser(data.user);
          setStats(data.stats);
          setRecentUsage(data.recentUsage);
        }
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const quotaPercent = (user.daily_used / user.daily_limit) * 100;
  const isLowQuota = quotaPercent >= 80;
  const isExceeded = quotaPercent >= 100;

  const getOperationName = (op: string) => {
    const names: Record<string, string> = {
      'add-text': '📝 文字水印',
      'add-image': '🖼️ 图片水印',
      'remove': '✨ 去除水印',
    };
    return names[op] || op;
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    return `${Math.floor(diff / 86400)}天前`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <button
          onClick={() => router.push("/")}
          className="mb-6 flex items-center text-slate-600 hover:text-slate-900 transition"
        >
          ← 返回首页
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 左侧：用户信息 */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="text-center">
                {user.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-100" 
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                )}
                <h1 className="text-xl font-bold text-slate-900 mb-1">
                  {user.name || "匿名用户"}
                </h1>
                <p className="text-sm text-slate-500 mb-3">{user.email}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  user.subscription_type === 'enterprise' 
                    ? 'bg-purple-100 text-purple-700' 
                    : user.subscription_type === 'pro'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {user.subscription_type === 'enterprise' ? '👔 企业版' 
                   : user.subscription_type === 'pro' ? '💎 Pro' 
                   : '🆓 免费版'}
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <button
                  onClick={() => window.location.href = "/api/auth/logout"}
                  className="w-full py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition"
                >
                  🚪 退出登录
                </button>
              </div>
            </div>

            {/* 升级提示 */}
            {user.subscription_type === 'free' && (
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="font-bold text-lg mb-2">🚀 升级 Pro</h3>
                <ul className="text-sm space-y-2 mb-4 opacity-90">
                  <li>• 每天 100 次处理</li>
                  <li>• 批量处理</li>
                  <li>• 高清导出</li>
                  <li>• 去除水印</li>
                </ul>
                <button
                  onClick={() => router.push("/pricing")}
                  className="w-full py-2.5 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition"
                >
                  立即升级 →
                </button>
              </div>
            )}
          </div>

          {/* 右侧：统计和用量 */}
          <div className="md:col-span-2 space-y-6">
            {/* 配额进度 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">📊 今日配额</h2>
              
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    {isExceeded ? '配额已用完' : isLowQuota ? '配额即将用完' : '剩余配额'}
                  </span>
                  <span className={`text-sm font-bold ${
                    isExceeded ? 'text-red-600' : isLowQuota ? 'text-orange-600' : 'text-blue-600'
                  }`}>
                    {user.daily_used} / {user.daily_limit}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isExceeded ? 'bg-red-500' : isLowQuota ? 'bg-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    }`}
                    style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                  ></div>
                </div>
                {isExceeded && (
                  <p className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    ⚠️ 今日配额已用完，明天再来吧！或 <a href="/pricing" className="underline font-medium">升级 Pro</a> 获得更多配额。
                  </p>
                )}
                {isLowQuota && !isExceeded && (
                  <p className="mt-3 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                    ⚠️ 配额剩余不足 20%，建议 <a href="/pricing" className="underline font-medium">升级 Pro</a>
                  </p>
                )}
              </div>

              {/* 使用统计 */}
              {stats && (
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{stats.today}</div>
                    <div className="text-xs text-slate-500 mt-1">今日处理</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">{stats.month}</div>
                    <div className="text-xs text-slate-500 mt-1">本月处理</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600">{stats.total}</div>
                    <div className="text-xs text-slate-500 mt-1">累计处理</div>
                  </div>
                </div>
              )}
            </div>

            {/* 最近记录 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">📜 最近记录</h2>
              {recentUsage.length > 0 ? (
                <div className="space-y-3">
                  {recentUsage.map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getOperationName(log.operation)}</span>
                        {log.file_size && (
                          <span className="text-xs text-slate-400">
                            {(log.file_size / 1024).toFixed(1)} KB
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-slate-500">{getTimeAgo(log.created_at)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <div className="text-4xl mb-2">📭</div>
                  <p>暂无使用记录</p>
                  <button
                    onClick={() => router.push("/")}
                    className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    开始处理图片 →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
