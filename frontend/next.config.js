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
  },
  // 禁用 Turbopack 缓存以减少构建产物大小
  experimental: {
    turbo: {
      disableFileSystemCache: true,
    },
  },
};

module.exports = nextConfig;
