"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const plans = [
  {
    id: "free",
    name: "免费版",
    price: 0,
    period: "",
    description: "适合偶尔使用的个人用户",
    features: [
      "✅ 每天 3 次处理",
      "✅ 基础文字水印",
      "✅ 标准画质导出",
      "❌ 批量处理",
      "❌ 去除水印",
      "❌ API 访问",
    ],
    cta: "开始使用",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    period: "元/月",
    originalPrice: 299,
    description: "适合频繁使用的专业人士",
    features: [
      "✅ 每天 100 次处理",
      "✅ 文字 + 图片水印",
      "✅ 高清画质导出",
      "✅ 批量处理 (10 张)",
      "✅ 去除水印 (5 次/天)",
      "❌ API 访问",
    ],
    cta: "立即升级",
    highlight: true,
    popular: true,
  },
  {
    id: "enterprise",
    name: "企业版",
    price: 199,
    period: "元/月",
    originalPrice: 1999,
    description: "适合团队和企业用户",
    features: [
      "✅ 无限次处理",
      "✅ 所有水印功能",
      "✅ 原画画质导出",
      "✅ 批量处理 (无限)",
      "✅ 去除水印 (无限)",
      "✅ API 访问",
      "✅ 专属客服支持",
    ],
    cta: "联系销售",
    highlight: false,
  },
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* 标题 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            选择适合你的方案
          </h1>
          <p className="text-xl text-slate-600">
            简单透明的定价，随时升级或取消
          </p>
        </div>

        {/* 价格卡片 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
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

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-slate-900">
                    ¥{plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-slate-500 ml-2">{plan.period}</span>
                  )}
                </div>
                {plan.originalPrice && (
                  <p className="text-slate-400 line-through mt-1">
                    原价 ¥{plan.originalPrice}
                  </p>
                )}
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
                onClick={async () => {
                  if (plan.id === "free") {
                    router.push("/");
                  } else if (plan.id === "enterprise") {
                    window.location.href = "mailto:sales@ybbtool.com";
                  } else if (plan.id === "pro") {
                    // 检查登录状态
                    try {
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
                          amount: 9.99, // Pro 版本价格 USD
                          currency: "USD",
                          plan: "Pro",
                        }),
                      });
                      
                      const data = await response.json();
                      
                      if (data.success && data.approvalUrl) {
                        // 跳转到 PayPal 支付页面
                        window.location.href = data.approvalUrl;
                      } else {
                        alert("创建订单失败：" + (data.error || "未知错误"));
                      }
                    } catch (error) {
                      console.error("Payment error:", error);
                      alert("支付系统暂时不可用，请稍后重试");
                    }
                  }
                }}
                className={`w-full py-4 rounded-xl font-semibold transition ${
                  plan.highlight
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {plan.cta}
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

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-8">
            常见问题
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "支持哪些支付方式？",
                a: "我们支持微信支付、支付宝、银联卡等多种支付方式。企业版还支持对公转账和开具增值税专用发票。",
              },
              {
                q: "如何退款？",
                a: "购买后 7 天内，如对产品不满意，可联系客服申请无条件全额退款。",
              },
              {
                q: "配额什么时候重置？",
                a: "每日配额在北京时间每天凌晨 0 点自动重置。",
              },
              {
                q: "可以升级或降级方案吗？",
                a: "可以随时升级方案，差价按比例计算。降级将在当前计费周期结束后生效。",
              },
              {
                q: "企业版有哪些额外服务？",
                a: "企业版包含私有化部署、定制功能开发、专属客服、SLA 服务保障、源码授权等服务。",
              },
              {
                q: "未登录用户可以使用吗？",
                a: "可以，未登录用户每天可免费处理 3 张图片。登录后每天免费 10 次，升级 Pro 后每天 100 次。",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="bg-white rounded-xl shadow-md p-6 group"
              >
                <summary className="font-semibold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-slate-400 group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="mt-4 text-slate-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-slate-600 mb-4">
            还有疑问？联系我们的团队
          </p>
          <a 
            href="mailto:support@ybbtool.com"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            📧 support@ybbtool.com
          </a>
        </div>
      </div>
    </div>
  );
}
