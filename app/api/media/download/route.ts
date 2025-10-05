import { NextResponse } from "next/server"
import { generatePresignedDownloadUrl } from "@/lib/s3"

export async function POST(request: Request) {
  try {
    const { fileName } = await request.json()

    if (!fileName) {
      return NextResponse.json(
        { error: "fileName is required" },
        { status: 400 }
      )
    }

    // Check if AWS is configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET_NAME) {
      return NextResponse.json(
        { error: "AWS S3 not configured" },
        { status: 503 }
      )
    }

    const downloadUrl = await generatePresignedDownloadUrl(fileName)

    return NextResponse.json({ downloadUrl })
  } catch (error) {
    console.error("Download URL generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    )
  }
}
