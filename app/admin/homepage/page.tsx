import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { HomepageEditor } from "@/components/admin/homepage-editor"
import Link from "next/link"

export default async function HomepageSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-[#DA291C]">Quản Lý Home Page</h1>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-[#2E2E2E] hover:bg-[#DA291C] rounded-lg transition-colors"
          >
            ← Dashboard
          </Link>
        </div>

        <HomepageEditor />
      </div>
    </div>
  )
}
