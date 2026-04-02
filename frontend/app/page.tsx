"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { processImage } from "@/lib/image-processor";
import { UserMenu } from "@/components/UserMenu";

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
    opacity: 1.0,
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 顶部导航 */}
      <nav className="flex-shrink-0 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
        <div className="max-w-[1920px] mx-auto px-6">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">💧</span>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Watermark Tool</h1>
                <p className="text-xs text-slate-500">在线水印处理工具</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <UserMenu />
              <Link 
                href="/pricing"
                className="hidden sm:inline-flex items-center text-sm text-slate-600 hover:text-blue-600 transition"
              >
                💎 定价
              </Link>
              <Link 
                href="/faq"
                className="hidden sm:inline-flex items-center text-sm text-slate-600 hover:text-blue-600 transition"
              >
                ❓ FAQ
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 - 铺满剩余空间 */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-[1920px] mx-auto px-6 py-4">
          <div className="grid grid-cols-10 gap-4 h-full">
            
            {/* 左侧设置面板 - 30% */}
            <div className="col-span-3 h-full">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 h-full overflow-y-auto">
                <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center">
                  <span className="w-1 h-5 bg-blue-500 rounded-full mr-2"></span>
                  操作设置
                </h2>
                
                {/* 操作选择 */}
                <div className="space-y-2 mb-5">
                  <button
                    onClick={() => setOperation("add-text")}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
                      operation === "add-text"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    📝 添加文字水印
                  </button>
                  <button
                    onClick={() => setOperation("add-image")}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
                      operation === "add-image"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    🖼️ 添加图片水印
                  </button>
                </div>

                {/* 文字水印设置 */}
                {operation === "add-text" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        水印文字
                      </label>
                      <input
                        type="text"
                        value={watermarkSettings.text}
                        onChange={(e) => setWatermarkSettings({ ...watermarkSettings, text: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="输入水印文字"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        效果模式
                      </label>
                      <div className="space-y-2">
                        {[
                          { key: "single", label: "单个水印", value: { tiled: false, diagonal: false } },
                          { key: "tiled", label: "🔲 平铺效果", value: { tiled: true, diagonal: false } },
                          { key: "diagonal", label: "↗️ 对角线", value: { tiled: false, diagonal: true } },
                        ].map((opt) => (
                          <label key={opt.key} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition">
                            <input
                              type="radio"
                              name="effect"
                              checked={opt.key === "single" ? !watermarkSettings.tiled && !watermarkSettings.diagonal : watermarkSettings[opt.key as keyof typeof opt.value]}
                              onChange={() => setWatermarkSettings({ ...watermarkSettings, ...opt.value })}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {!watermarkSettings.tiled && !watermarkSettings.diagonal && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">位置</label>
                        <select
                          value={watermarkSettings.position}
                          onChange={(e) => setWatermarkSettings({ ...watermarkSettings, position: e.target.value as any })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
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
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        不透明度：{Math.round(watermarkSettings.opacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={watermarkSettings.opacity}
                        onChange={(e) => setWatermarkSettings({ ...watermarkSettings, opacity: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        字体大小：{watermarkSettings.fontSize}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="120"
                        value={watermarkSettings.fontSize}
                        onChange={(e) => setWatermarkSettings({ ...watermarkSettings, fontSize: parseInt(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">颜色</label>
                        <input
                          type="color"
                          value={watermarkSettings.color}
                          onChange={(e) => setWatermarkSettings({ ...watermarkSettings, color: e.target.value })}
                          className="w-full h-10 rounded-lg cursor-pointer border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">旋转：{watermarkSettings.rotation}°</label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={watermarkSettings.rotation}
                          onChange={(e) => setWatermarkSettings({ ...watermarkSettings, rotation: parseInt(e.target.value) })}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2"
                        />
                      </div>
                    </div>

                    {(watermarkSettings.tiled || watermarkSettings.diagonal) && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          间距：{watermarkSettings.spacing}px
                        </label>
                        <input
                          type="range"
                          min="20"
                          max="300"
                          value={watermarkSettings.spacing}
                          onChange={(e) => setWatermarkSettings({ ...watermarkSettings, spacing: parseInt(e.target.value) })}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* 图片水印设置 */}
                {operation === "add-image" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        上传水印图片
                      </label>
                      <input
                        ref={watermarkInputRef}
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleWatermarkImageChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                      />
                      {watermarkImage && (
                        <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                          <img src={watermarkImage.src} alt="Watermark" className="h-16 object-contain mx-auto" />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">效果模式</label>
                      <div className="space-y-2">
                        {[
                          { key: "single", label: "单个水印", value: { tiled: false, diagonal: false } },
                          { key: "tiled", label: "🔲 平铺效果", value: { tiled: true, diagonal: false } },
                          { key: "diagonal", label: "↗️ 对角线", value: { tiled: false, diagonal: true } },
                        ].map((opt) => (
                          <label key={opt.key} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition">
                            <input
                              type="radio"
                              name="effect"
                              checked={opt.key === "single" ? !watermarkSettings.tiled && !watermarkSettings.diagonal : watermarkSettings[opt.key as keyof typeof opt.value]}
                              onChange={() => setWatermarkSettings({ ...watermarkSettings, ...opt.value })}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {!watermarkSettings.tiled && !watermarkSettings.diagonal && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">位置</label>
                        <select
                          value={watermarkSettings.position}
                          onChange={(e) => setWatermarkSettings({ ...watermarkSettings, position: e.target.value as any })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
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
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        大小：{Math.round(watermarkSettings.scale * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={watermarkSettings.scale}
                        onChange={(e) => setWatermarkSettings({ ...watermarkSettings, scale: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        不透明度：{Math.round(watermarkSettings.opacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={watermarkSettings.opacity}
                        onChange={(e) => setWatermarkSettings({ ...watermarkSettings, opacity: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* 处理按钮 */}
                <button
                  onClick={handleProcess}
                  disabled={!file || processing}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {processing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      处理中...
                    </span>
                  ) : (
                    "✨ 开始处理"
                  )}
                </button>

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    ⚠️ {error}
                  </div>
                )}
              </div>
            </div>

            {/* 右侧预览区域 - 70% */}
            <div className="col-span-7 h-full flex flex-col gap-4">
              {/* 上半部分：图片上传区 */}
              <div className="flex-shrink-0 bg-white rounded-2xl shadow-lg border border-slate-200 p-5">
                <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center">
                  <span className="w-1 h-5 bg-blue-500 rounded-full mr-2"></span>
                  上传图片
                </h2>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-300 p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <svg className="w-8 h-8 text-blue-600" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-base font-medium text-slate-700">点击或拖拽上传图片</p>
                  <p className="mt-1 text-sm text-slate-500">支持 JPG, PNG, WebP 格式</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* 下半部分：图片预览区 */}
              <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-200 p-5 min-h-0 flex flex-col">
                <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center">
                  <span className="w-1 h-5 bg-green-500 rounded-full mr-2"></span>
                  图片预览
                </h2>
                <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 overflow-auto flex items-center justify-center relative">
                  {!preview && (
                    <div className="text-center text-slate-400">
                      <svg className="w-16 h-16 mx-auto mb-3 opacity-50" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-sm">请先上传图片</p>
                    </div>
                  )}

                  {preview && (
                    <div className="relative w-full h-full p-4 flex items-center justify-center">
                      <img 
                        src={result || preview} 
                        alt="Preview" 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg" 
                      />
                      <button
                        onClick={() => {
                          setPreview(null);
                          setFile(null);
                          setResult(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-red-50 transition-all"
                      >
                        <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      {result && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                          <button
                            onClick={handleDownload}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            📥 下载处理后的图片
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 底部功能说明 - 单独一行 */}
      <footer className="flex-shrink-0 bg-white/80 backdrop-blur-md border-t border-slate-200">
        <div className="max-w-[1920px] mx-auto px-6 py-3">
          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">🔒</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">隐私安全</h4>
                <p className="text-xs text-slate-500">图片在浏览器处理，不上传服务器</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">快速处理</h4>
                <p className="text-xs text-slate-500">本地处理，无需等待上传下载</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">🌍</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">完全免费</h4>
                <p className="text-xs text-slate-500">无使用限制，无水印</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
