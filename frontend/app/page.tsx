"use client";

import { useState, useRef, useCallback } from "react";
import { processImage } from "@/lib/image-processor";

type Operation = "add-text" | "add-image";

interface WatermarkSettings {
  text: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  opacity: number;
  scale: number;
  fontSize: number;
  color: string;
  rotation: number;
  tiled: boolean;
  diagonal: boolean;
  spacing: number;
}

export default function Home() {
  const [operation, setOperation] = useState<Operation>("add-text");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>({
    text: "水印",
    position: "bottom-right",
    opacity: 1.0,  // 默认 100%
    scale: 0.25,
    fontSize: 48,
    color: "#FFFFFF",
    rotation: 0,
    tiled: false,
    diagonal: false,
    spacing: 100,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const [watermarkImage, setWatermarkImage] = useState<HTMLImageElement | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    setFile(f);
    setError(null);
    setResult(null);
    
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleWatermarkImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    const img = new Image();
    const url = URL.createObjectURL(f);
    
    img.onload = () => {
      setWatermarkImage(img);
      URL.revokeObjectURL(url);
    };
  }, []);

  const handleProcess = useCallback(async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const options = operation === "add-text"
        ? {
            text: watermarkSettings.text,
            position: watermarkSettings.position,
            opacity: watermarkSettings.opacity,
            scale: watermarkSettings.scale,
            fontSize: watermarkSettings.fontSize,
            color: watermarkSettings.color,
            rotation: watermarkSettings.rotation,
            tiled: watermarkSettings.tiled,
            diagonal: watermarkSettings.diagonal,
            spacing: watermarkSettings.spacing,
          }
        : {
            image: watermarkImage,
            position: watermarkSettings.position,
            opacity: watermarkSettings.opacity,
            scale: watermarkSettings.scale,
            rotation: watermarkSettings.rotation,
            tiled: watermarkSettings.tiled,
            diagonal: watermarkSettings.diagonal,
            spacing: watermarkSettings.spacing,
          };

      const blob = await processImage(file, operation, options as any);
      const url = URL.createObjectURL(blob);
      setResult(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "处理失败");
    } finally {
      setProcessing(false);
    }
  }, [file, operation, watermarkSettings, watermarkImage]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    
    const a = document.createElement("a");
    a.href = result;
    a.download = `watermarked_${file?.name || "image.png"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [result, file]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">💧</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Watermark Tool</h1>
                <p className="text-xs text-gray-500">在线水印处理工具 - 内存处理，隐私安全</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：设置面板 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
              {/* 操作选择 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">选择操作</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setOperation("add-text")}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      operation === "add-text"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    📝 添加文字水印
                  </button>
                  <button
                    onClick={() => setOperation("add-image")}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      operation === "add-image"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    🖼️ 添加图片水印
                  </button>
                </div>
              </div>

              {/* 文字水印设置 */}
              {operation === "add-text" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">文字设置</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      水印文字
                    </label>
                    <input
                      type="text"
                      value={watermarkSettings.text}
                      onChange={(e) => setWatermarkSettings({ ...watermarkSettings, text: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="输入水印文字"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      效果模式
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="effect"
                          checked={!watermarkSettings.tiled && !watermarkSettings.diagonal}
                          onChange={() => setWatermarkSettings({ ...watermarkSettings, tiled: false, diagonal: false })}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">单个水印</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="effect"
                          checked={watermarkSettings.tiled}
                          onChange={() => setWatermarkSettings({ ...watermarkSettings, tiled: true, diagonal: false })}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">🔲 平铺效果</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="effect"
                          checked={watermarkSettings.diagonal}
                          onChange={() => setWatermarkSettings({ ...watermarkSettings, tiled: false, diagonal: true })}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">↗️ 对角线效果</span>
                      </label>
                    </div>
                  </div>

                  {/* 位置选择（仅单个水印模式） */}
                  {!watermarkSettings.tiled && !watermarkSettings.diagonal && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        位置
                      </label>
                      <select
                        value={watermarkSettings.position}
                        onChange={(e) => setWatermarkSettings({ ...watermarkSettings, position: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="top-left">左上角</option>
                        <option value="top-right">右上角</option>
                        <option value="bottom-left">左下角</option>
                        <option value="bottom-right">右下角</option>
                        <option value="center">居中</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      不透明度：{Math.round(watermarkSettings.opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={watermarkSettings.opacity}
                      onChange={(e) => setWatermarkSettings({ ...watermarkSettings, opacity: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      字体大小：{watermarkSettings.fontSize}px
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="120"
                      value={watermarkSettings.fontSize}
                      onChange={(e) => setWatermarkSettings({ ...watermarkSettings, fontSize: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      颜色
                    </label>
                    <input
                      type="color"
                      value={watermarkSettings.color}
                      onChange={(e) => setWatermarkSettings({ ...watermarkSettings, color: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      旋转：{watermarkSettings.rotation}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={watermarkSettings.rotation}
                      onChange={(e) => setWatermarkSettings({ ...watermarkSettings, rotation: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {(watermarkSettings.tiled || watermarkSettings.diagonal) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        间距：{watermarkSettings.spacing}px
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="300"
                        value={watermarkSettings.spacing}
                        onChange={(e) => setWatermarkSettings({ ...watermarkSettings, spacing: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 图片水印设置 */}
              {operation === "add-image" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">图片水印设置</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      上传水印图片
                    </label>
                    <input
                      ref={watermarkInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleWatermarkImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {watermarkImage && (
                      <div className="mt-2">
                        <img src={watermarkImage.src} alt="Watermark" className="h-20 object-contain border rounded" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      效果模式
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="effect"
                          checked={!watermarkSettings.tiled && !watermarkSettings.diagonal}
                          onChange={() => setWatermarkSettings({ ...watermarkSettings, tiled: false, diagonal: false })}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">单个水印</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="effect"
                          checked={watermarkSettings.tiled}
                          onChange={() => setWatermarkSettings({ ...watermarkSettings, tiled: true, diagonal: false })}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">🔲 平铺效果</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="effect"
                          checked={watermarkSettings.diagonal}
                          onChange={() => setWatermarkSettings({ ...watermarkSettings, tiled: false, diagonal: true })}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">↗️ 对角线效果</span>
                      </label>
                    </div>
                  </div>

                  {/* 位置选择（仅单个水印模式） */}
                  {!watermarkSettings.tiled && !watermarkSettings.diagonal && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        位置
                      </label>
                      <select
                        value={watermarkSettings.position}
                        onChange={(e) => setWatermarkSettings({ ...watermarkSettings, position: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="top-left">左上角</option>
                        <option value="top-right">右上角</option>
                        <option value="bottom-left">左下角</option>
                        <option value="bottom-right">右下角</option>
                        <option value="center">居中</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      大小：{Math.round(watermarkSettings.scale * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={watermarkSettings.scale}
                      onChange={(e) => setWatermarkSettings({ ...watermarkSettings, scale: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      不透明度：{Math.round(watermarkSettings.opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={watermarkSettings.opacity}
                      onChange={(e) => setWatermarkSettings({ ...watermarkSettings, opacity: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {(watermarkSettings.tiled || watermarkSettings.diagonal) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        间距：{watermarkSettings.spacing}px
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="300"
                        value={watermarkSettings.spacing}
                        onChange={(e) => setWatermarkSettings({ ...watermarkSettings, spacing: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 处理按钮 */}
              <button
                onClick={handleProcess}
                disabled={!file || processing}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition shadow-lg"
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    处理中...
                  </span>
                ) : (
                  "开始处理"
                )}
              </button>

              {/* 错误提示 */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>

          {/* 右侧：预览区域 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">图片预览</h3>
              
              {/* 上传区域 */}
              {!preview && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 transition"
                >
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-4 text-lg text-gray-600">点击或拖拽上传图片</p>
                  <p className="mt-2 text-sm text-gray-500">支持 JPG, PNG, WebP 格式</p>
                </div>
              )}

              {/* 图片预览 */}
              {preview && (
                <div className="space-y-4">
                  <div className="relative">
                    <img src={preview} alt="Preview" className="w-full h-auto rounded-lg shadow" />
                    <button
                      onClick={() => {
                        setPreview(null);
                        setFile(null);
                        setResult(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-red-50 transition"
                    >
                      <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* 处理结果 */}
                  {result && (
                    <div className="border-t pt-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">✅ 处理完成</h4>
                      <img src={result} alt="Result" className="w-full h-auto rounded-lg shadow mb-4" />
                      <button
                        onClick={handleDownload}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg"
                      >
                        📥 下载图片
                      </button>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* 功能说明 */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow p-4">
                <div className="text-2xl mb-2">🔒</div>
                <h4 className="font-semibold text-gray-900">隐私安全</h4>
                <p className="text-sm text-gray-600 mt-1">图片在浏览器处理，不上传服务器</p>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold text-gray-900">快速处理</h4>
                <p className="text-sm text-gray-600 mt-1">本地处理，无需等待上传下载</p>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <div className="text-2xl mb-2">🌍</div>
                <h4 className="font-semibold text-gray-900">完全免费</h4>
                <p className="text-sm text-gray-600 mt-1">无使用限制，无水印</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            💧 Watermark Tool - 在线水印处理工具 | 内存处理，隐私安全
          </p>
        </div>
      </footer>
    </div>
  );
}
