"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface MediaItem {
  fileName: string
  url: string
  type: "image" | "video"
  size: number
  lastModified: string
}

export function MediaManager() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [bulkDownloading, setBulkDownloading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      const response = await fetch("/api/media")
      const data = await response.json()
      
      const items: MediaItem[] = await Promise.all(
        (data.files || []).map(async (file: { Key?: string; Size?: number; LastModified?: string }) => {
          const fileName = file.Key || ""
          const isVideo = /\.(mp4|mov|avi|webm)$/i.test(fileName)
          
          // Get presigned URL for viewing
          let presignedUrl = ""
          try {
            const urlResponse = await fetch("/api/media/download", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fileName }),
            })
            if (urlResponse.ok) {
              const { downloadUrl } = await urlResponse.json()
              presignedUrl = downloadUrl
            }
          } catch (error) {
            console.error("Failed to get presigned URL:", error)
          }
          
          return {
            fileName,
            url: presignedUrl || `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME || ""}.s3.${process.env.NEXT_PUBLIC_AWS_REGION || "ap-southeast-1"}.amazonaws.com/${fileName}`,
            type: isVideo ? "video" : "image",
            size: file.Size || 0,
            lastModified: file.LastModified || new Date().toISOString(),
          }
        })
      )

      setMedia(items)
    } catch (error) {
      console.error("Failed to fetch media:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa "${fileName}"?`)) {
      return
    }

    setDeleting(fileName)

    try {
      const response = await fetch("/api/media/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete")
      }

      // Remove from list
      setMedia(media.filter((m) => m.fileName !== fileName))
      
      // Refresh to update stats
      router.refresh()
    } catch (error) {
      console.error("Delete failed:", error)
      alert("Xóa thất bại. Vui lòng thử lại.")
    } finally {
      setDeleting(null)
    }
  }

  const handleBulkDownload = async () => {
    if (selectedItems.size === 0) return

    setBulkDownloading(true)

    try {
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      const selectedMedia = media.filter(m => selectedItems.has(m.fileName))
      
      // Download all files and add to zip
      for (const item of selectedMedia) {
        try {
          // Get presigned download URL
          const response = await fetch("/api/media/download", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName: item.fileName }),
          })

          if (!response.ok) {
            throw new Error("Failed to get download URL")
          }

          const { downloadUrl } = await response.json()

          // Fetch file content
          const fileResponse = await fetch(downloadUrl)
          const blob = await fileResponse.blob()

          // Add to zip with original filename (without path)
          const fileName = item.fileName.split("/").pop() || item.fileName
          zip.file(fileName, blob)
        } catch (error) {
          console.error(`Failed to download ${item.fileName}:`, error)
        }
      }

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: "blob" })

      // Download zip
      const link = document.createElement("a")
      link.href = URL.createObjectURL(zipBlob)
      link.download = `media-${Date.now()}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      alert(`Đã tải xuống ${selectedItems.size} file${selectedItems.size > 1 ? 's' : ''} trong file ZIP!`)
    } catch (error) {
      console.error("Bulk download failed:", error)
      alert("Tải xuống thất bại. Vui lòng thử lại.")
    } finally {
      setBulkDownloading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return
    
    if (!confirm(`Bạn có chắc muốn xóa ${selectedItems.size} file${selectedItems.size > 1 ? 's' : ''}?`)) {
      return
    }

    setBulkDeleting(true)

    try {
      const deletePromises = Array.from(selectedItems).map(fileName =>
        fetch("/api/media/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName }),
        })
      )

      await Promise.all(deletePromises)

      // Remove from list
      setMedia(media.filter((m) => !selectedItems.has(m.fileName)))
      setSelectedItems(new Set())
      
      alert(`Đã xóa thành công ${selectedItems.size} file${selectedItems.size > 1 ? 's' : ''}!`)
      
      // Refresh to update stats
      router.refresh()
    } catch (error) {
      console.error("Bulk delete failed:", error)
      alert("Xóa thất bại. Vui lòng thử lại.")
    } finally {
      setBulkDeleting(false)
    }
  }

  const toggleSelectItem = (fileName: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(fileName)) {
      newSelected.delete(fileName)
    } else {
      newSelected.add(fileName)
    }
    setSelectedItems(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedItems.size === media.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(media.map(m => m.fileName)))
    }
  }

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    alert("Link đã được copy!")
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#DA291C]"></div>
        <p className="mt-4 text-gray-400">Loading media...</p>
      </div>
    )
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-12 bg-[#1C1C1C] rounded-lg">
        <svg
          className="mx-auto h-12 w-12 text-gray-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-gray-400">Chưa có media nào</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Media Files ({media.length})</h2>
        
        {/* Bulk Actions */}
        {selectedItems.size > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Đã chọn: {selectedItems.size} file{selectedItems.size > 1 ? 's' : ''}
            </span>
            <button
              onClick={handleBulkDownload}
              disabled={bulkDownloading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {bulkDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang tạo ZIP...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Tải ZIP ({selectedItems.size} file{selectedItems.size > 1 ? 's' : ''})
                </>
              )}
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {bulkDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang xóa...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Xóa {selectedItems.size} file{selectedItems.size > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="bg-[#1C1C1C] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#2E2E2E]">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === media.length && media.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-600 text-[#DA291C] focus:ring-[#DA291C]"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2E2E]">
              {media.map((item) => (
                <tr key={item.fileName} className="hover:bg-[#2E2E2E]/50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.fileName)}
                      onChange={() => toggleSelectItem(item.fileName)}
                      className="w-4 h-4 rounded border-gray-600 text-[#DA291C] focus:ring-[#DA291C]"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-16 bg-[#2E2E2E] rounded overflow-hidden">
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={item.fileName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white truncate max-w-xs">
                      {item.fileName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      item.type === "video" 
                        ? "bg-purple-900/30 text-purple-400" 
                        : "bg-blue-900/30 text-blue-400"
                    }`}>
                      {item.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatFileSize(item.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(item.lastModified)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleCopyLink(item.url)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Copy link"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 transition-colors"
                        title="View"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>
                      <button
                        onClick={() => handleDelete(item.fileName)}
                        disabled={deleting === item.fileName}
                        className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === item.fileName ? (
                          <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
