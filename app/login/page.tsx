"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    try {
      // Force refresh CSRF token before login
      await fetch("/api/auth/csrf", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });

      // Use default redirect behavior to avoid JSON parsing
      signIn("google", { callbackUrl: "/admin/dashboard" });
    } catch (error) {
      console.error("Login exception:", error);
      alert("Login failed: " + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-[#1C1C1C] p-8 rounded-lg shadow-xl max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#DA291C] mb-2">
            Quỷ Đỏ Official
          </h1>
          <p className="text-gray-400">Đăng nhập để quản lý media</p>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white text-black py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-3 mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          Đăng nhập bằng Google
        </button>

        {/* Info Box */}
        <div className="bg-[#2E2E2E] p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-2">
            ℹ️ <span className="font-semibold text-white">Thông tin:</span>
          </p>
          <ul className="text-sm text-gray-400 space-y-1 ml-4">
            <li>• Chỉ admin được phép truy cập</li>
            <li>• Đăng nhập bằng tài khoản Google</li>
            <li>• Session tự động lưu 30 ngày</li>
          </ul>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-gray-400 hover:text-[#DA291C] transition-colors text-sm"
          >
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
