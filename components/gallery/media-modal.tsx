"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useEffect } from "react"

interface MediaModalProps {
  isOpen: boolean
  onClose: () => void
  fileName: string
  url: string
  type: "image" | "video" | "embed"
  embedType?: "youtube" | "tiktok"
}

export function MediaModal({ isOpen, onClose, fileName, url, type }: MediaModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  const handleDownload = async () => {
    try {
      // Get presigned download URL
      const response = await fetch("/api/media/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName }),
      })

      if (!response.ok) {
        throw new Error("Failed to get download URL")
      }

      const { downloadUrl } = await response.json()

      // Download using presigned URL
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = fileName
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Download failed:", error)
      alert("Download failed. Please try again.")
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: fileName,
          url: url,
        })
      } catch (error) {
        console.error("Share failed:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url)
      alert("Link copied to clipboard!")
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-5xl w-full max-h-[90vh] bg-[#1C1C1C] rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Media content */}
            <div className="relative w-full" style={{ maxHeight: "70vh" }}>
              {type === "embed" ? (
                <div className="aspect-video bg-black">
                  {(() => {
                    // Extract video ID and create embed URL
                    let embedUrl = ""
                    
                    if (url.includes("youtube.com") || url.includes("youtu.be")) {
                      const videoId = url.includes("youtu.be")
                        ? url.split("youtu.be/")[1]?.split("?")[0]
                        : url.split("v=")[1]?.split("&")[0]
                      if (videoId) {
                        embedUrl = `https://www.youtube.com/embed/${videoId}`
                      }
                    } else if (url.includes("tiktok.com")) {
                      const videoId = url.split("/video/")[1]?.split("?")[0]
                      if (videoId) {
                        embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`
                      }
                    }

                    return embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={fileName}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#DA291C] hover:text-[#FBE122]"
                        >
                          Open original link →
                        </a>
                      </div>
                    )
                  })()}
                </div>
              ) : type === "image" ? (
                <div className="relative w-full h-full min-h-[400px]">
                  <Image
                    src={url}
                    alt={fileName}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <video
                  src={url}
                  controls
                  autoPlay
                  className="w-full h-full max-h-[70vh]"
                />
              )}
            </div>

            {/* Info and actions */}
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-white truncate">
                {fileName}
              </h3>

              <div className="flex gap-4">
                {type !== "embed" && (
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-[#DA291C] hover:bg-[#FBE122] hover:text-black px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="flex-1 bg-[#2E2E2E] hover:bg-[#DA291C] px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
