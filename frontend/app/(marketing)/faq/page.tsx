"use client";

import Link from "next/link";

const faqCategories = [
  {
    id: "general",
    name: "通用问题",
    icon: "💡",
    faqs: [
      {
        q: "什么是 Watermark Tool？",
        a: "Watermark Tool 是一款在线图片水印处理工具，支持添加文字/图片水印、批量处理、去除水印等功能。所有处理都在浏览器本地完成，保护您的隐私安全。",
      },
      {
        q: "需要注册账号吗？",
        a: "未登录用户每天可免费处理 3 张图片。注册登录后每天免费 10 次，升级 Pro 会员后每天 100 次，企业版无限次使用。",
      },
      {
        q: "支持哪些图片格式？",
        a: "支持 JPG、JPEG、PNG、WebP 等常见图片格式。",
      },
      {
        q: "图片大小有限制吗？",
        a: "免费版最大 2MB，Pro 版最大 20MB，企业版最大 100MB。",
      },
      {
        q: "处理后的图片会保存多久？",
        a: "所有处理都在您的浏览器本地完成，图片不会上传到服务器，因此不存在保存时间的概念。下载后图片保存在您的设备中。",
      },
    ],
  },
  {
    id: "account",
    name: "账号与登录",
    icon: "👤",
    faqs: [
      {
        q: "如何登录？",
        a: "点击右上角「登录」按钮，使用 Google 账号授权登录即可。我们使用 OAuth 2.0 安全认证，不会存储您的密码。",
      },
      {
        q: "如何退出登录？",
        a: "点击右上角头像，选择「退出登录」即可。",
      },
      {
        q: "如何查看我的使用配额？",
        a: "登录后点击右上角头像，进入个人中心即可查看今日配额、使用统计和最近记录。",
      },
      {
        q: "忘记密码怎么办？",
        a: "我们使用 Google OAuth 登录，无需设置密码。如需更换绑定邮箱，请联系客服。",
      },
    ],
  },
  {
    id: "quota",
    name: "配额与限制",
    icon: "📊",
    faqs: [
      {
        q: "配额什么时候重置？",
        a: "每日配额在北京时间每天凌晨 0 点自动重置。",
      },
      {
        q: "未用完的配额可以累积吗？",
        a: "不可以，每日配额仅限当天使用，次日清零。",
      },
      {
        q: "配额不够用怎么办？",
        a: "您可以：1) 等待次日重置；2) 升级 Pro 会员（每天 100 次）；3) 升级企业版（无限次）。",
      },
      {
        q: "批量处理如何计算配额？",
        a: "批量处理按实际处理图片数量计算配额。例如一次处理 5 张图片，消耗 5 次配额。",
      },
    ],
  },
  {
    id: "payment",
    name: "付费与订阅",
    icon: "💳",
    faqs: [
      {
        q: "Pro 会员多少钱？",
        a: "Pro 会员 ¥29/月 或 ¥299/年（省¥49）。",
      },
      {
        q: "企业版多少钱？",
        a: "企业版 ¥199/月 或 ¥1999/年（省¥389）。如需私有化部署或定制功能，请联系销售获取报价。",
      },
      {
        q: "支持哪些支付方式？",
        a: "支持微信支付、支付宝、银联卡等。企业版还支持对公转账。",
      },
      {
        q: "如何退款？",
        a: "购买后 7 天内，如对产品不满意，可联系客服申请无条件全额退款。",
      },
      {
        q: "可以升级或降级方案吗？",
        a: "可以随时升级方案，差价按比例计算。降级将在当前计费周期结束后生效。",
      },
      {
        q: "订阅会自动续费吗？",
        a: "是的，订阅默认开启自动续费。您可以随时在个人中心取消自动续费。",
      },
    ],
  },
  {
    id: "technical",
    name: "技术问题",
    icon: "🔧",
    faqs: [
      {
        q: "图片处理安全吗？",
        a: "非常安全。所有图片处理都在您的浏览器本地完成，不会上传到服务器。我们使用 WebAssembly 和 Canvas API 进行图片处理。",
      },
      {
        q: "支持哪些浏览器？",
        a: "支持 Chrome、Firefox、Safari、Edge 等现代浏览器。建议使用最新版本以获得最佳体验。",
      },
      {
        q: "手机可以使用吗？",
        a: "可以，我们的网站适配移动端，支持在手机浏览器上使用。",
      },
      {
        q: "有 API 接口吗？",
        a: "企业版提供 API 接口，可用于集成到您的系统中。请联系销售获取 API 文档。",
      },
      {
        q: "处理速度慢怎么办？",
        a: "处理速度取决于图片大小和设备性能。建议：1) 使用较小的图片；2) 关闭其他占用资源的程序；3) 使用性能更好的设备。",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 transition"
          >
            ← 返回首页
          </Link>
        </div>

        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            常见问题
          </h1>
          <p className="text-xl text-slate-600">
            找到你需要的答案
          </p>
        </div>

        {/* 搜索框（预留） */}
        <div className="mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索问题..."
              className="w-full px-6 py-4 bg-white rounded-2xl shadow-md border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
          </div>
        </div>

        {/* FAQ 分类 */}
        {faqCategories.map((category) => (
          <div key={category.id} className="mb-12">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-3">{category.icon}</span>
              <h2 className="text-2xl font-bold text-slate-900">{category.name}</h2>
            </div>

            <div className="space-y-4">
              {category.faqs.map((faq, i) => (
                <details
                  key={i}
                  className="bg-white rounded-xl shadow-md p-6 group"
                >
                  <summary className="font-semibold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                    {faq.q}
                    <span className="text-slate-400 group-open:rotate-180 transition">▼</span>
                  </summary>
                  <p className="mt-4 text-slate-600 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}

        {/* 联系支持 */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-8 text-white text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">没有找到答案？</h2>
          <p className="mb-6 opacity-90">
            联系我们的支持团队，我们会尽快为您解答
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="mailto:support@ybbtool.com"
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition"
            >
              📧 发送邮件
            </a>
            <a 
              href="/pricing"
              className="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition"
            >
              💬 在线咨询
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
