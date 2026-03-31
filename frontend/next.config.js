/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
    // 静态导出需要禁用图片优化
    unoptimized: true,
  },
  // 静态导出
  output: 'export',
  // 关闭缓存生成
  cache: false,
};

module.exports = nextConfig;
