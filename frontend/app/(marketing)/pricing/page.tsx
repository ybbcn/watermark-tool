"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// 积分包配置
const creditPacks = [
  {
    id: "credit-small",
    name: "小份积分",
    price: 4.99,
    credits: 10,
    type: "one-time",
    description: "适合偶尔使用",
    perCredit: "$0.50/次",
    features: [
      "✅ 10 次处理",
      "✅ 永久有效",
      "✅ 随时使用",
    ],
    cta: "购买积分",
    highlight: false,
  },
  {
    id: "credit-medium",
    name: "中份积分",
    price: 9.99,
    credits: 25,
    type: "one-time",
    originalPrice: 12.50,
    description: "最受欢迎",
    perCredit: "$0.40/次",
    features: [
      "✅ 25 次处理",
      "✅ 永久有效",
      "✅ 随时使用",
      "🔥 省 20%",
    ],
    cta: "购买积分",
    highlight: true,
    popular: true,
  },
  {
    id: "credit-large",
    name: "大份积分",
    price: 19.99,
    credits: 60,
    type: "one-time",
    originalPrice: 30.00,
    description: "超值优惠",
    perCredit: "$0.33/次",
    features: [
      "✅ 60 次处理",
      "✅ 永久有效",
      "✅ 随时使用",
      "💰 省 33%",
    ],
    cta: "购买积分",
    highlight: false,
    save: "最划算",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePayment = async (item: any) => {
    setLoading(true);
    
    try {
      // 检查登录状态
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      
      if (!sessionData.user) {
        alert("请先登录后再购买");
        window.location.href = "/api/auth/login";
        return;
      }
      
      // 创建 PayPal 订单
      const response = await fetch("/api/payment/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: item.price,
          currency: "USD",
          plan: item.id,
          type: "one-time",
          credits: item.credits,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP ${response.status}`);
      }
      
      if (data.success && data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error(data.error || "创建订单失败");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("支付失败：" + (error instanceof Error ? error.message : "未知错误"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* 标题 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            选择适合你的方案
          </h1>
          <p className="text-xl text-slate-600">
            简单透明的定价，随时升级
          </p>
        </div>

        {/* 提示信息 */}
        <div className="text-center mb-8">
          <p className="text-lg text-slate-600 mb-2">
            💰 积分包 - 永久有效，随时使用
          </p>
          <p className="text-sm text-slate-500">
            （订阅功能即将上线，敬请期待）
          </p>
        </div>

        {/* 价格卡片 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {creditPacks.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl p-8 ${
                plan.highlight
                  ? "ring-2 ring-blue-500 shadow-2xl scale-105"
                  : "shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    🔥 最受欢迎
                  </span>
                </div>
              )}
              {plan.save && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    {plan.save}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-slate-900">
                    ${plan.price}
                  </span>
                </div>
                {plan.originalPrice ? (
                  <p className="text-slate-400 line-through mt-1">
                    原价 ${plan.originalPrice}
                  </p>
                ) : null}
                {plan.credits ? (
                  <p className="text-blue-600 font-medium mt-2">
                    {plan.credits} 次处理 • {plan.perCredit}
                  </p>
                ) : null}
                <p className="text-slate-600 mt-4">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-lg mr-2">{feature.split(" ")[0]}</span>
                    <span className="text-slate-700">{feature.split(" ").slice(1).join(" ")}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePayment(plan)}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold transition ${
                  plan.highlight
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? '处理中...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* 功能对比表 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-8">
            功能对比
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-4 px-4 font-semibold text-slate-700">功能</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-700">免费版</th>
                  <th className="text-center py-4 px-4 font-semibold text-blue-600">Pro</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-700">企业版</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "每日处理次数", free: "3 次", pro: "100 次", enterprise: "无限" },
                  { feature: "图片大小限制", free: "2MB", pro: "20MB", enterprise: "100MB" },
                  { feature: "文字水印", free: "✅", pro: "✅", enterprise: "✅" },
                  { feature: "图片水印", free: "❌", pro: "✅", enterprise: "✅" },
                  { feature: "批量处理", free: "❌", pro: "10 张", enterprise: "无限" },
                  { feature: "去除水印", free: "❌", pro: "5 次/天", enterprise: "无限" },
                  { feature: "高清导出", free: "❌", pro: "✅", enterprise: "✅" },
                  { feature: "API 访问", free: "❌", pro: "❌", enterprise: "✅" },
                  { feature: "技术支持", free: "社区", pro: "邮件", enterprise: "专属客服" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4 text-slate-700">{row.feature}</td>
                    <td className="text-center py-4 px-4 text-slate-600">{row.free}</td>
                    <td className="text-center py-4 px-4 font-medium text-blue-600 bg-blue-50">{row.pro}</td>
                    <td className="text-center py-4 px-4 text-slate-600">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
