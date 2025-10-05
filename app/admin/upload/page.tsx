import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { UploadForm } from "@/components/admin/upload-form"
import { EmbedForm } from "@/components/admin/embed-form"
import Link from "next/link"

export default async function UploadPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-[#DA291C]">Upload Media</h1>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-[#2E2E2E] hover:bg-[#DA291C] rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
        
        <div className="max-w-2xl space-y-8">
          <UploadForm />
          <EmbedForm />
        </div>
      </div>
    </div>
  )
}
