import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const EMBEDS_FILE = path.join(DATA_DIR, "embeds.json");

interface Embed {
  id: string;
  url: string;
  title: string;
  type: "youtube" | "tiktok";
  createdAt: string;
}

async function getEmbeds(): Promise<Embed[]> {
  try {
    if (!existsSync(EMBEDS_FILE)) {
      return [];
    }
    const data = await readFile(EMBEDS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveEmbeds(embeds: Embed[]) {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  await writeFile(EMBEDS_FILE, JSON.stringify(embeds, null, 2));
}

export async function GET() {
  try {
    const embeds = await getEmbeds();
    return NextResponse.json({ embeds });
  } catch (error) {
    console.error("Failed to get embeds:", error);
    return NextResponse.json({ embeds: [] });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    if (
      !url.includes("youtube.com") &&
      !url.includes("youtu.be") &&
      !url.includes("tiktok.com")
    ) {
      return NextResponse.json(
        { error: "Only YouTube and TikTok URLs are supported" },
        { status: 400 }
      );
    }

    // Determine type
    const type = url.includes("tiktok.com") ? "tiktok" : "youtube";

    // Create embed object
    const embed: Embed = {
      id: Date.now().toString(),
      url,
      title: `${type === "youtube" ? "YouTube" : "TikTok"} Video`,
      type,
      createdAt: new Date().toISOString(),
    };

    // Save to file
    const embeds = await getEmbeds();
    embeds.unshift(embed); // Add to beginning
    await saveEmbeds(embeds);

    return NextResponse.json({ success: true, embed });
  } catch (error) {
    console.error("Failed to save embed:", error);
    return NextResponse.json(
      { error: "Failed to save embed" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const embeds = await getEmbeds();
    const filtered = embeds.filter((e) => e.id !== id);
    await saveEmbeds(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete embed:", error);
    return NextResponse.json(
      { error: "Failed to delete embed" },
      { status: 500 }
    );
  }
}
