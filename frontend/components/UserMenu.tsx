"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  daily_limit?: number;
  daily_used?: number;
  subscription_type?: string;
}

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchUser = useCallback(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchUser();
    
    // 监听配额更新事件
    const handleQuotaUpdate = () => {
      console.log('📊 [UserMenu] Quota update event received, refreshing...');
      fetchUser();
    };
    window.addEventListener('quota-updated', handleQuotaUpdate);
    
    // 定期刷新配额（每 10 秒）
    const interval = setInterval(() => {
      console.log('📊 [UserMenu] Periodic quota refresh');
      fetchUser();
    }, 10000);
    
    return () => {
      window.removeEventListener('quota-updated', handleQuotaUpdate);
      clearInterval(interval);
    };
  }, [fetchUser]);

  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  const quotaPercent = user && user.daily_limit 
    ? (user.daily_used || 0) / user.daily_limit * 100 
    : 0;
  const isLowQuota = quotaPercent >= 80;

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={() => window.location.href = "/api/auth/login"}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow"
      >
        登录
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 hover:bg-slate-100 rounded-lg px-2 py-1.5 transition"
      >
        {user.picture ? (
          <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
        )}
        {isLowQuota && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-100 z-20 overflow-hidden">
            {/* 用户信息 */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center space-x-3 mb-2">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{user.name || "匿名用户"}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              
              {/* 配额进度 */}
              {user.daily_limit && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">今日配额</span>
                    <span className={`font-medium ${isLowQuota ? 'text-red-600' : 'text-slate-600'}`}>
                      {user.daily_used || 0}/{user.daily_limit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isLowQuota ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* 菜单项 */}
            <div className="py-2">
              <button
                onClick={() => {
                  router.push("/profile");
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition flex items-center"
              >
                <span className="mr-2">👤</span> 个人中心
              </button>
              {user.subscription_type === 'free' && (
                <button
                  onClick={() => {
                    router.push("/pricing");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition flex items-center"
                >
                  <span className="mr-2">💎</span> 升级 Pro
                </button>
              )}
              <button
                onClick={() => {
                  router.push("/faq");
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition flex items-center"
              >
                <span className="mr-2">❓</span> 常见问题
              </button>
            </div>

            {/* 退出登录 */}
            <div className="py-2 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition flex items-center"
              >
                <span className="mr-2">🚪</span> 退出登录
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
