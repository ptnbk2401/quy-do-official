import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { MediaManager } from "@/components/admin/media-manager"
import { EmbedManager } from "@/components/admin/embed-manager"
import Link from "next/link"

export default async function MediaManagementPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-[#DA291C]">Quản Lý Media</h1>
          <div className="flex gap-4">
            <Link
              href="/admin/upload"
              className="px-4 py-2 bg-[#DA291C] hover:bg-[#FBE122] hover:text-black rounded-lg transition-colors"
            >
              + Upload New
            </Link>
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 bg-[#2E2E2E] hover:bg-[#DA291C] rounded-lg transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          {/* S3 Media Files */}
          <MediaManager />

          {/* Video Embeds */}
          <div className="pt-8 border-t border-[#2E2E2E]">
            <EmbedManager />
          </div>
        </div>
      </div>
    </div>
  )
}
