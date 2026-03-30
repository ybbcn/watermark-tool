"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<string>("add-text");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    // 调用水印 API
    const formData = new FormData();
    formData.append("file", file);
    const text = (document.getElementById("watermark-text") as HTMLInputElement)?.value || "水印";
    formData.append("text", text);
    try {
      const res = await fetch("/api/add-watermark", { method: "POST", body: formData });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "watermarked_" + file.name;
        a.click();
      }
    } catch (e) {
      console.error(e);
    }
    setProcessing(false);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500">加载中...</span>
      </div>
    );
  }

  return (
    <>
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-2xl">💧</span>
              <h1 className="ml-2 text-xl font-bold text-gray-900">Watermark Tool</h1>
              <span className="ml-2 text-sm text-gray-500">在线水印处理 · 内存处理 · 隐私安全</span>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <div className="flex items-center space-x-3">
                  {session.user?.image && (
                    <img
                      src={session.user.image}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-700">
                    {session.user?.name || session.user?.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 transition"
                  >
                    登出
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className="flex items-center space-x-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>使用 Google 登录</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 免责声明 */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0"><span className="text-xl">⚠️</span></div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">法律声明</h3>
              <p className="text-sm text-yellow-700 mt-1">本工具仅供学习和个人使用。请勿用于移除他人拥有版权的水印。</p>
            </div>
          </div>
        </div>

        {/* 功能选项卡 */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "add-text", label: "添加文字水印" },
                { id: "add-logo", label: "添加 Logo 水印" },
                { id: "remove", label: "移除水印" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 水印操作面板 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {activeTab === "add-text" && "添加文字水印"}
            {activeTab === "add-logo" && "添加 Logo 水印"}
            {activeTab === "remove" && "移除水印"}
          </h2>

          {/* 上传区域 */}
          <div className="drop-zone border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-1 text-sm text-gray-600">点击或拖拽上传图片</p>
              <p className="text-xs text-gray-500">支持 JPG, PNG, WebP，最大 10MB</p>
            </label>
          </div>

          {/* 预览 */}
          {preview && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">原图</h3>
                <div className="border rounded-lg overflow-hidden">
                  <img src={preview} alt="原图" className="max-w-full max-h-80 object-contain mx-auto" />
                </div>
              </div>
            </div>
          )}

          {/* 水印参数 */}
          {activeTab === "add-text" && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">水印文字</label>
                <input
                  type="text"
                  id="watermark-text"
                  defaultValue="水印"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                  placeholder="输入水印文字"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">位置</label>
                <select className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border">
                  <option value="bottom-right">右下角</option>
                  <option value="bottom-left">左下角</option>
                  <option value="top-right">右上角</option>
                  <option value="top-left">左上角</option>
                  <option value="center">居中</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  透明度: <span id="opacity-val">80%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="80"
                  className="w-full"
                  onChange={(e) =>
                    (document.getElementById("opacity-val")!.textContent = e.target.value + "%")
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  字体大小: <span id="fontsize-val">16</span>
                </label>
                <input
                  type="range"
                  min="12"
                  max="200"
                  defaultValue="16"
                  className="w-full"
                  onChange={(e) =>
                    (document.getElementById("fontsize-val")!.textContent = e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* 处理按钮 */}
          {preview && (
            <button
              onClick={handleProcess}
              disabled={processing}
              className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {processing ? "处理中..." : "处理并下载"}
            </button>
          )}
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            💧 Watermark Tool v1.0 · 图片内存处理，不存储到服务器
          </p>
        </div>
      </footer>
    </>
  );
}
