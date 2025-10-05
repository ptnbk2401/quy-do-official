"use client"

interface VideoEmbedProps {
  url: string
  title?: string
}

export function VideoEmbed({ url, title = "Video" }: VideoEmbedProps) {
  // Extract video ID from URL
  const getEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be")
        ? url.split("youtu.be/")[1]?.split("?")[0]
        : url.split("v=")[1]?.split("&")[0]
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }

    // TikTok
    if (url.includes("tiktok.com")) {
      const videoId = url.split("/video/")[1]?.split("?")[0]
      if (videoId) {
        return `https://www.tiktok.com/embed/v2/${videoId}`
      }
    }

    return null
  }

  const embedUrl = getEmbedUrl(url)

  if (!embedUrl) {
    return (
      <div className="aspect-video bg-[#2E2E2E] rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-gray-400 mb-2">Invalid video URL</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#DA291C] hover:text-[#FBE122] text-sm"
          >
            Open original link →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
