"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

const adminMenuItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: "📊",
    description: "Tổng quan",
  },
  {
    name: "Media Manager",
    href: "/admin/media",
    icon: "🖼️",
    description: "Quản lý media",
  },
  {
    name: "Upload",
    href: "/admin/upload",
    icon: "⬆️",
    description: "Tải lên media",
  },
  {
    name: "Homepage",
    href: "/admin/homepage",
    icon: "🏠",
    description: "Cài đặt trang chủ",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#DA291C] mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Bar */}
      <header className="bg-[#1C1C1C] border-b border-[#2E2E2E] sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="text-2xl font-bold text-[#DA291C] hover:text-[#FBE122] transition-colors"
            >
              🔴 Quỷ Đỏ Official
            </Link>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">Admin Panel</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              🏠 Trang chủ
            </Link>
            <Link
              href="/gallery"
              target="_blank"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              👁️ Gallery
            </Link>
            <div className="flex items-center gap-2 text-sm border-l border-[#2E2E2E] pl-4">
              <span className="text-gray-400">👤</span>
              <span className="text-white">{session.user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[#1C1C1C] border-r border-[#2E2E2E] min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4">
            <div className="space-y-2">
              {adminMenuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                      ${
                        isActive
                          ? "bg-[#DA291C] text-white shadow-lg"
                          : "text-gray-400 hover:bg-[#2E2E2E] hover:text-white"
                      }
                    `}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs opacity-75">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-8 border-t border-[#2E2E2E]">
              <div className="text-xs text-gray-500 uppercase mb-3 px-4">
                Quick Actions
              </div>
              <div className="space-y-2">
                <Link
                  href="/admin/upload"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-[#FBE122] transition-colors"
                >
                  <span>⚡</span>
                  <span>Upload nhanh</span>
                </Link>
                <Link
                  href="/gallery"
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-[#FBE122] transition-colors"
                >
                  <span>🔗</span>
                  <span>Xem Gallery</span>
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
