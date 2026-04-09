"use client";

import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="text-orange-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">支付已取消</h2>
        <p className="text-slate-600 mb-6">
          您取消了支付流程。如果有任何问题，请联系客服。
        </p>
        <div className="space-y-3">
          <Link
            href="/pricing"
            className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition"
          >
            返回定价页
          </Link>
          <Link
            href="/"
            className="block w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
