export interface MediaFile {
  id: string
  name: string
  url: string
  type: 'image' | 'video' | 'embed'
  size?: number
  uploadedAt: string
  embedUrl?: string // For TikTok/YouTube
}

export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}
