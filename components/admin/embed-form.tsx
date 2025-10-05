"use client"

import { useState } from "react"

export function EmbedForm() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate URL
      if (!url.includes("tiktok.com") && !url.includes("youtube.com") && !url.includes("youtu.be")) {
        throw new Error("Please enter a valid TikTok or YouTube URL")
      }

      // Save embed
      const response = await fetch("/api/media/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add embed")
      }

      setSuccess(true)
      setUrl("")
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add embed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1C1C1C] p-8 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Embed TikTok/YouTube</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="embed-url" className="block text-sm font-medium mb-2">
            Video URL
          </label>
          <input
            id="embed-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@... or https://youtube.com/watch?v=..."
            className="w-full bg-[#2E2E2E] border border-[#2E2E2E] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#DA291C] focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !url}
          className="w-full bg-[#DA291C] hover:bg-[#FBE122] hover:text-black px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Add Embed"}
        </button>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg">
            <p className="text-green-500">Embed added successfully!</p>
          </div>
        )}
      </form>

      <div className="mt-6 p-4 bg-[#2E2E2E] rounded-lg">
        <h3 className="font-semibold mb-2">Supported platforms:</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• TikTok: https://www.tiktok.com/@username/video/...</li>
          <li>• YouTube: https://youtube.com/watch?v=...</li>
          <li>• YouTube Short: https://youtu.be/...</li>
        </ul>
      </div>
    </div>
  )
}
