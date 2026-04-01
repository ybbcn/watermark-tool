import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "💧 Watermark Tool - 在线水印处理工具",
  description: "在线水印处理工具，内存处理，隐私安全，支持添加文字/图片水印和移除水印",
  keywords: "水印，图片处理，在线工具，添加水印，移除水印",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <script src="https://cdn.tailwindcss.com" async />
      </head>
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
