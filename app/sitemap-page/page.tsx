import Link from "next/link"

export default function SitemapPage() {
  const pages = [
    {
      title: "🏠 Home Page",
      path: "/",
      description: "Trang chủ - Landing page với hero section, about, và social links"
    },
    {
      title: "🖼️ Gallery / Media Hub",
      path: "/gallery",
      description: "Thư viện media - Xem tất cả ảnh và video từ S3"
    },
    {
      title: "🔐 Login",
      path: "/login",
      description: "Đăng nhập admin"
    },
    {
      title: "⚙️ Admin Dashboard",
      path: "/admin",
      description: "Trang quản trị chính"
    },
    {
      title: "📤 Admin - Upload Media",
      path: "/admin/upload",
      description: "Upload ảnh/video lên S3"
    },
    {
      title: "🏠 Admin - Homepage Settings",
      path: "/admin/homepage",
      description: "Quản lý nội dung trang chủ (hero, about, social links)"
    },
    {
      title: "📺 Admin - Embeds",
      path: "/admin/embeds",
      description: "Quản lý TikTok/YouTube embeds"
    },
    {
      title: "🗺️ Sitemap",
      path: "/sitemap-page",
      description: "Trang này - Danh sách tất cả các trang"
    }
  ]

  const apiEndpoints = [
    {
      title: "GET /api/homepage",
      description: "Lấy homepage settings"
    },
    {
      title: "POST /api/homepage",
      description: "Cập nhật homepage settings"
    },
    {
      title: "GET /api/media",
      description: "Lấy danh sách media từ S3"
    },
    {
      title: "POST /api/upload",
      description: "Upload file lên S3"
    },
    {
      title: "DELETE /api/media",
      description: "Xóa file từ S3"
    },
    {
      title: "GET /api/embeds",
      description: "Lấy danh sách embeds"
    },
    {
      title: "POST /api/embeds",
      description: "Thêm/cập nhật embed"
    },
    {
      title: "DELETE /api/embeds",
      description: "Xóa embed"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#1a0000] to-black text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-[#DA291C]/20 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              <span className="text-white">Quỷ Đỏ</span>{" "}
              <span className="text-[#DA291C]">Sitemap</span>
            </h1>
            <Link
              href="/"
              className="text-gray-400 hover:text-[#DA291C] transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Pages Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <span className="text-[#DA291C]">📄</span>
            All Pages
          </h2>
          <div className="grid gap-4">
            {pages.map((page, index) => (
              <Link
                key={index}
                href={page.path}
                className="group bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#DA291C]/20 hover:border-[#DA291C]/50 rounded-lg p-6 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-[#DA291C] transition-colors">
                      {page.title}
                    </h3>
                    <p className="text-gray-400 mb-2">{page.description}</p>
                    <code className="text-sm text-[#FBE122] bg-black/50 px-3 py-1 rounded">
                      {page.path}
                    </code>
                  </div>
                  <svg 
                    className="w-6 h-6 text-[#DA291C] opacity-0 group-hover:opacity-100 transition-opacity" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* API Endpoints Section */}
        <section>
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <span className="text-[#DA291C]">🔌</span>
            API Endpoints
          </h2>
          <div className="grid gap-4">
            {apiEndpoints.map((endpoint, index) => (
              <div
                key={index}
                className="bg-[#1a1a1a] border border-[#DA291C]/20 rounded-lg p-6"
              >
                <h3 className="text-lg font-bold mb-2 font-mono text-[#FBE122]">
                  {endpoint.title}
                </h3>
                <p className="text-gray-400">{endpoint.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack Info */}
        <section className="mt-16 bg-gradient-to-r from-[#DA291C]/10 to-[#FBE122]/10 border border-[#DA291C]/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">🛠️ Tech Stack</h2>
          <div className="grid md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h3 className="font-bold text-white mb-2">Frontend</h3>
              <ul className="space-y-1">
                <li>• Next.js 15 (App Router)</li>
                <li>• React 19</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• Framer Motion</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Backend</h3>
              <ul className="space-y-1">
                <li>• Next.js API Routes</li>
                <li>• AWS S3 (Media Storage)</li>
                <li>• JSON File Storage</li>
                <li>• Basic Auth</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
