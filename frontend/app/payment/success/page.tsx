"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handlePayment = async () => {
      try {
        const token = searchParams.get('token');
        const PayerID = searchParams.get('PayerID');
        const type = searchParams.get('type') || 'one-time';
        
        if (!token) {
          setError('支付令牌无效');
          setProcessing(false);
          return;
        }
        
        // 捕获订单
        const response = await fetch("/api/payment/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: token,
            payerId: PayerID,
            type,
          }),
        });
        
        const data = await response.json();
        
        if (data.success || data.status === 'COMPLETED') {
          setSuccess(true);
        } else {
          setError(data.message || '支付处理失败');
        }
      } catch (err) {
        console.error('Payment error:', err);
        setError('支付处理失败，请联系客服');
      } finally {
        setProcessing(false);
      }
    };
    
    handlePayment();
  }, [searchParams]);

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
      {processing && (
        <>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">处理支付...</h2>
          <p className="text-slate-600">请稍候，正在确认您的支付</p>
        </>
      )}
      
      {success && (
        <>
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">支付成功！</h2>
          <p className="text-slate-600 mb-6">
            感谢您的购买！您的账户已更新，可以立即使用所有功能。
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition"
            >
              开始使用
            </Link>
            <Link
              href="/profile"
              className="block w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition"
            >
              查看账户
            </Link>
          </div>
        </>
      )}
      
      {error && (
        <>
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">支付失败</h2>
          <p className="text-slate-600 mb-6">{error}</p>
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
        </>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">加载中...</h2>
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
