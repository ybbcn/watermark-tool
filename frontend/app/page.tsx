"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("add-text");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

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
    const formData = new FormData();
    formData.append("file", file);
    const text = (document.getElementById("watermark-text") as HTMLInputElement)?.value || "水印";
    formData.append("text", text);
    try {
      const res = await fetch("/api/add-watermark", { method: "POST", body: formData });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setResult(url);
      }
    } catch (e) {
      console.error(e);
    }
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-2xl">💧</span>
              <h1 className="ml-2 text-xl font-bold text-gray-900">Watermark Tool</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 选项卡 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("add-text")}
                className={`${
                  activeTab === "add-text"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
              >
                添加文字水印
              </button>
              <button
                onClick={() => setActiveTab("add-image")}
                className={`${
                  activeTab === "add-image"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
              >
                添加图片水印
              </button>
            </nav>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* 文件上传 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择图片
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {/* 预览 */}
          {preview && (
            <div className="mb-6">
              <img src={preview} alt="Preview" className="max-w-full h-auto rounded-lg shadow" />
            </div>
          )}

          {/* 水印设置 */}
          {activeTab === "add-text" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                水印文字
              </label>
              <input
                id="watermark-text"
                type="text"
                defaultValue="水印"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              />
            </div>
          )}

          {/* 处理按钮 */}
          <button
            onClick={handleProcess}
            disabled={!file || processing}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {processing ? "处理中..." : "开始处理"}
          </button>

          {/* 结果 */}
          {result && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">处理完成</h3>
              <img src={result} alt="Result" className="max-w-full h-auto rounded-lg shadow" />
              <a
                href={result}
                download="watermarked.png"
                className="mt-4 inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                下载图片
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
