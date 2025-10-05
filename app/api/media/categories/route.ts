import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Get all categories from S3 prefixes
export async function GET() {
  try {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    if (!bucketName) {
      return NextResponse.json({ categories: [] });
    }

    // List all objects
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
    });

    const response = await s3Client.send(command);
    const files = response.Contents || [];

    // Extract categories from file paths
    const categoryMap = new Map<string, { count: number; createdAt: string }>();

    files.forEach((file) => {
      const key = file.Key || "";
      const parts = key.split("/");

      if (parts.length > 1) {
        // Has category (folder)
        const category = parts[0];
        const existing = categoryMap.get(category);

        if (existing) {
          existing.count++;
        } else {
          categoryMap.set(category, {
            count: 1,
            createdAt:
              file.LastModified?.toISOString() || new Date().toISOString(),
          });
        }
      } else {
        // No category (root level) - use "uncategorized"
        const existing = categoryMap.get("uncategorized");

        if (existing) {
          existing.count++;
        } else {
          categoryMap.set("uncategorized", {
            count: 1,
            createdAt:
              file.LastModified?.toISOString() || new Date().toISOString(),
          });
        }
      }
    });

    // Convert to array
    const categories = Array.from(categoryMap.entries()).map(([id, data]) => ({
      id,
      name: id
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      count: data.count,
      createdAt: data.createdAt,
    }));

    // Sort by name
    categories.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Failed to get categories:", error);
    return NextResponse.json({ categories: [] });
  }
}

// Add new category (just validate, actual creation happens on upload)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Invalid category name" },
        { status: 400 }
      );
    }

    // Normalize name
    const normalized = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    if (!normalized) {
      return NextResponse.json(
        { error: "Invalid category name" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, category: normalized });
  } catch (error) {
    console.error("Failed to add category:", error);
    return NextResponse.json(
      { error: "Failed to add category" },
      { status: 500 }
    );
  }
}
