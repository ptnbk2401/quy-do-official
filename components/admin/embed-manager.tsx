"use client"

import { useState, useEffect } from "react"

interface Embed {
  id: string
  url: string
  title: string
  type: "youtube" | "tiktok"
  createdAt: string
}

export function EmbedManager() {
  const [embeds, setEmbeds] = useState<Embed[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  useEffect(() => {
    fetchEmbeds()
  }, [])

  const fetchEmbeds = async () => {
    try {
      const response = await fetch("/api/media/embed")
      const data = await response.json()
      setEmbeds(data.embeds || [])
    } catch (error) {
      console.error("Failed to fetch embeds:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa "${title}"?`)) {
      return
    }

    setDeleting(id)

    try {
      const response = await fetch("/api/media/embed", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete")
      }

      // Remove from list
      setEmbeds(embeds.filter((e) => e.id !== id))
      alert("Đã xóa embed thành công!")
    } catch (error) {
      console.error("Delete failed:", error)
      alert("Xóa thất bại. Vui lòng thử lại.")
    } finally {
      setDeleting(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return
    
    if (!confirm(`Bạn có chắc muốn xóa ${selectedItems.size} embed${selectedItems.size > 1 ? 's' : ''}?`)) {
      return
    }

    setBulkDeleting(true)

    try {
      const deletePromises = Array.from(selectedItems).map(id =>
        fetch("/api/media/embed", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        })
      )

      await Promise.all(deletePromises)

      // Remove from list
      setEmbeds(embeds.filter((e) => !selectedItems.has(e.id)))
      setSelectedItems(new Set())
      
      alert(`Đã xóa thành công ${selectedItems.size} embed${selectedItems.size > 1 ? 's' : ''}!`)
    } catch (error) {
      console.error("Bulk delete failed:", error)
      alert("Xóa thất bại. Vui lòng thử lại.")
    } finally {
      setBulkDeleting(false)
    }
  }

  const handleBulkCopy = () => {
    if (selectedItems.size === 0) return

    const selectedEmbeds = embeds.filter(e => selectedItems.has(e.id))
    const urls = selectedEmbeds.map(e => e.url).join("\n")
    
    navigator.clipboard.writeText(urls)
    alert(`Đã copy ${selectedItems.size} link${selectedItems.size > 1 ? 's' : ''}!`)
  }

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedItems.size === embeds.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(embeds.map(e => e.id)))
    }
  }

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    alert("Link đã được copy!")
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
        <p className="mt-4 text-gray-400">Loading embeds...</p>
      </div>
    )
  }

  if (embeds.length === 0) {
    return (
      <div className="text-center py-12 bg-[#1C1C1C] rounded-lg">
        <svg
          className="mx-auto h-12 w-12 text-gray-600 mb-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
        </svg>
        <p className="text-gray-400">Chưa có embed nào</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Video Embeds ({embeds.length})</h2>
        
        {/* Bulk Actions */}
        {selectedItems.size > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Đã chọn: {selectedItems.size} embed{selectedItems.size > 1 ? 's' : ''}
            </span>
            <button
              onClick={handleBulkCopy}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy {selectedItems.size} link{selectedItems.size > 1 ? 's' : ''}
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
                  Xóa {selectedItems.size} embed{selectedItems.size > 1 ? 's' : ''}
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
                    checked={selectedItems.size === embeds.length && embeds.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-600 text-[#DA291C] focus:ring-[#DA291C]"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  URL
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
              {embeds.map((embed) => (
                <tr key={embed.id} className="hover:bg-[#2E2E2E]/50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(embed.id)}
                      onChange={() => toggleSelectItem(embed.id)}
                      className="w-4 h-4 rounded border-gray-600 text-[#DA291C] focus:ring-[#DA291C]"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      embed.type === "youtube" 
                        ? "bg-red-900/30 text-red-400" 
                        : "bg-pink-900/30 text-pink-400"
                    }`}>
                      {embed.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      {embed.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-400 truncate max-w-xs">
                      {embed.url}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(embed.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleCopyLink(embed.url)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Copy link"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <a
                        href={embed.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 transition-colors"
                        title="Open link"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      <button
                        onClick={() => handleDelete(embed.id, embed.title)}
                        disabled={deleting === embed.id}
                        className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === embed.id ? (
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
