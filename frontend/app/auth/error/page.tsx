"use client";

export default function Error() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full text-center">
        <h1 className="text-xl font-bold mb-4 text-red-600">登录出错</h1>
        <p className="text-gray-600 mb-6">登录过程中遇到问题，请重试。</p>
        <a
          href="/auth/signin"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          重新登录
        </a>
      </div>
    </div>
  );
}
