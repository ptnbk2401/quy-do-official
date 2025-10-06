import { NextResponse } from "next/server";
import { generatePresignedDownloadUrl } from "@/lib/s3";

export async function POST(request: Request) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: "urls array is required" },
        { status: 400 }
      );
    }

    // Check if AWS is configured
    if (
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY ||
      !process.env.AWS_S3_BUCKET_NAME
    ) {
      return NextResponse.json(
        { error: "AWS S3 not configured" },
        { status: 503 }
      );
    }

    const refreshedUrls: Record<string, string> = {};

    for (const url of urls) {
      if (!url || typeof url !== "string") continue;

      // Extract S3 key from presigned URL
      const match = url.match(
        /https:\/\/([^.]+)\.s3\.([^.]+)\.amazonaws\.com\/([^?]+)/
      );
      if (match) {
        const [, bucket, region, key] = match;
        try {
          const freshUrl = await generatePresignedDownloadUrl(key);
          refreshedUrls[url] = freshUrl;
          console.log(`Refreshed URL for: ${key}`);
        } catch (error) {
          console.error(`Failed to refresh URL for ${key}:`, error);
          // Keep original URL if refresh fails
          refreshedUrls[url] = url;
        }
      } else {
        // Not a presigned URL, keep as is
        refreshedUrls[url] = url;
      }
    }

    return NextResponse.json({ refreshedUrls });
  } catch (error) {
    console.error("URL refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh URLs" },
      { status: 500 }
    );
  }
}
