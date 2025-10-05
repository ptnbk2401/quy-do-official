"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CategorySelector } from "./category-selector"
// import { VideoPreview } from "./video-preview"
// import { ImageCrop } from "./image-crop"

export function UploadForm() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [category, setCategory] = useState("")
  const [uploadQueue, setUploadQueue] = useState<File[]>([])
  const [currentFile, setCurrentFile] = useState<string>("")
  const router = useRouter()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check category
    if (!category) {
      setError("Vui lòng chọn hoặc tạo category trước")
      e.target.value = ""
      return
    }

    // Clear previous messages
    setError(null)
    setSuccess(null)

    // Upload all files
    await handleMultipleFileUpload(files)
    
    // Reset input
    e.target.value = ""
  }

  const handleMultipleFileUpload = async (files: File[]) => {
    setUploading(true)
    setUploadQueue(files)
    
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setCurrentFile(file.name)
      setProgress(Math.round(((i + 1) / files.length) * 100))

      try {
        await handleFileUpload(file)
        successCount++
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err)
        failCount++
      }
    }

    // Show results
    setUploading(false)
    setUploadQueue([])
    setCurrentFile("")
    setProgress(0)

    if (successCount > 0) {
      setSuccess(`✅ Đã upload thành công ${successCount} file${successCount > 1 ? 's' : ''}!`)
      // Refresh after 2 seconds
      setTimeout(() => {
        router.refresh()
        setSuccess(null)
      }, 2000)
    }

    if (failCount > 0) {
      setError(`❌ Upload thất bại ${failCount} file${failCount > 1 ? 's' : ''}`)
    }
  }

  const handleFileUpload = async (file: File): Promise<void> => {
    // Step 1: Get presigned URL
    const response = await fetch("/api/media/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        category: category,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get upload URL")
    }

    const { uploadUrl } = await response.json()

    // Step 2: Upload file to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    })

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file")
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#1C1C1C] p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-6">Upload Media</h2>
        
        {/* Category Selector */}
        <div className="mb-6">
          <CategorySelector value={category} onChange={setCategory} />
        </div>

        {/* File Upload */}
        <label className="block">
          <div className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            category 
              ? "border-[#2E2E2E] hover:border-[#DA291C] cursor-pointer" 
              : "border-[#3E3E3E] cursor-not-allowed opacity-50"
          }`}>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading || !category}
              className="hidden"
            />
            {uploading ? (
              <div className="space-y-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#DA291C] mb-2"></div>
                <p className="text-gray-400">
                  Uploading {uploadQueue.length} file{uploadQueue.length > 1 ? 's' : ''}... {progress}%
                </p>
                {currentFile && (
                  <p className="text-sm text-gray-500">Current: {currentFile}</p>
                )}
                <div className="w-full bg-[#2E2E2E] rounded-full h-2">
                  <div
                    className="bg-[#DA291C] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-gray-400 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF, MP4, MOV up to 100MB
                </p>
                <p className="text-xs text-[#DA291C] mt-2">
                  💡 Có thể chọn nhiều files cùng lúc
                </p>
              </>
            )}
          </div>
        </label>

        {/* Success Message */}
        {success && (
          <div className="mt-4 p-4 bg-green-900/20 border border-green-500 rounded-lg animate-pulse">
            <p className="text-green-500 font-semibold">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-500">{error}</p>
          </div>
        )}
      </div>

      {/* Preview Modals - TODO: Add later */}
    </div>
  )
}
