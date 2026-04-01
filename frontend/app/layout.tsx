import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "💧 Watermark Tool - 在线水印处理工具",
  description: "在线水印处理工具，内存处理，隐私安全",
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
