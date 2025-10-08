import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadHomepageMedia } from "@/lib/s3";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const section = formData.get("section") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (images and videos)
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime", // .mov files
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPG, PNG, WebP, MP4, WebM, MOV allowed",
        },
        { status: 400 }
      );
    }

    // Validate file size (200MB max for videos, 10MB for images)
    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? 200 * 1024 * 1024 : 10 * 1024 * 1024; // 200MB for video, 10MB for images
    if (file.size > maxSize) {
      const maxSizeMB = isVideo ? 200 : 10;
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // Generate filename with homepage category
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const s3Key = `homepage/${section}-${timestamp}.${ext}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3 with public access for homepage media
    const publicUrl = await uploadHomepageMedia(buffer, s3Key, file.type);

    // Return public URL directly for immediate use
    return NextResponse.json({
      success: true,
      url: publicUrl, // Return public URL, not S3 key
      filename: s3Key,
      s3Key: s3Key, // Also return S3 key for settings storage
    });
  } catch (error) {
    console.error("Failed to upload image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
