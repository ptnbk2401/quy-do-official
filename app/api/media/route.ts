import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listMediaFiles, generatePresignedDownloadUrl } from "@/lib/s3";

// Cache API response for 1 hour
export const revalidate = 3600;

export async function GET() {
  try {
    // Check if AWS credentials are configured
    if (
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY ||
      !process.env.AWS_S3_BUCKET_NAME
    ) {
      console.warn(
        "AWS credentials not configured. Returning empty media list."
      );
      return NextResponse.json({
        files: [],
        warning:
          "AWS S3 not configured. Please set up AWS credentials in .env.local",
      });
    }

    const files = await listMediaFiles();

    // Filter out config files and homepage folder
    const mediaFiles = files.filter((file) => {
      const key = file.Key || "";
      // Exclude config folder and homepage folder
      return !key.startsWith("config/") && !key.startsWith("homepage/");
    });

    // Add presigned URLs to each file
    const filesWithUrls = await Promise.all(
      mediaFiles.map(async (file) => {
        const url = await generatePresignedDownloadUrl(file.Key!);
        return {
          ...file,
          url,
        };
      })
    );

    return NextResponse.json({ files: filesWithUrls });
  } catch (error) {
    console.error("Failed to fetch media:", error);
    // Return empty array instead of error to allow app to work without S3
    return NextResponse.json({
      files: [],
      error: "Failed to fetch media from S3. Check AWS configuration.",
    });
  }
}

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Handle upload logic here
  return NextResponse.json({ message: "Upload endpoint" });
}
