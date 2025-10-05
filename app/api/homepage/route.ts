import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generatePresignedDownloadUrl } from "@/lib/s3";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const HOMEPAGE_FILE = path.join(DATA_DIR, "homepage.json");

interface HomepageSettings {
  hero: {
    backgroundImage: string;
    backgroundVideo: string;
    logo: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
  };
  about: {
    image: string;
    title: string;
    description: string;
  };
  highlights: {
    enabled: boolean;
    limit: number;
  };
  social: {
    tiktok: string;
    youtube: string;
    facebook: string;
    instagram: string;
  };
}

const DEFAULT_SETTINGS: HomepageSettings = {
  hero: {
    backgroundImage: "/images/old-trafford-hero.jpg",
    backgroundVideo: "",
    logo: "",
    title: "Quỷ Đỏ Official",
    subtitle:
      "Trái tim Quỷ Đỏ - Nơi lưu giữ khoảnh khắc đáng nhớ của Manchester United",
    ctaText: "Khám phá Media Hub",
    ctaLink: "/gallery",
  },
  about: {
    image: "/images/fans-collage.jpeg",
    title: "Câu chuyện của chúng tôi",
    description:
      "Quỷ Đỏ Official ra đời từ niềm đam mê bất tận với Manchester United – nơi người hâm mộ cùng chia sẻ và lưu giữ những khoảnh khắc đáng nhớ nhất.",
  },
  highlights: {
    enabled: true,
    limit: 6,
  },
  social: {
    tiktok: "https://www.tiktok.com/@united_insights",
    youtube: "https://youtube.com/@quydoofficial",
    facebook: "https://www.facebook.com/share/176i3fyvkT/",
    instagram: "https://www.instagram.com/man_utd.vn",
  },
};

async function getSettings(): Promise<HomepageSettings> {
  try {
    if (!existsSync(HOMEPAGE_FILE)) {
      return DEFAULT_SETTINGS;
    }
    const data = await readFile(HOMEPAGE_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

async function saveSettings(settings: HomepageSettings) {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  await writeFile(HOMEPAGE_FILE, JSON.stringify(settings, null, 2));
}

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const settings = await getSettings();

    // Generate presigned URLs for S3 keys
    const settingsWithUrls = { ...settings };

    // Hero background image
    if (
      settings.hero.backgroundImage &&
      settings.hero.backgroundImage.startsWith("homepage/")
    ) {
      try {
        settingsWithUrls.hero.backgroundImage =
          await generatePresignedDownloadUrl(settings.hero.backgroundImage);
      } catch (error) {
        console.error("Failed to generate URL for hero background:", error);
      }
    }

    // Hero background video
    if (
      settings.hero.backgroundVideo &&
      settings.hero.backgroundVideo.startsWith("homepage/")
    ) {
      try {
        settingsWithUrls.hero.backgroundVideo =
          await generatePresignedDownloadUrl(settings.hero.backgroundVideo);
      } catch (error) {
        console.error("Failed to generate URL for hero video:", error);
      }
    }

    // Hero logo
    if (settings.hero.logo && settings.hero.logo.startsWith("homepage/")) {
      try {
        settingsWithUrls.hero.logo = await generatePresignedDownloadUrl(
          settings.hero.logo
        );
      } catch (error) {
        console.error("Failed to generate URL for logo:", error);
      }
    }

    // About image
    if (settings.about.image && settings.about.image.startsWith("homepage/")) {
      try {
        settingsWithUrls.about.image = await generatePresignedDownloadUrl(
          settings.about.image
        );
      } catch (error) {
        console.error("Failed to generate URL for about image:", error);
      }
    }

    return NextResponse.json({ settings: settingsWithUrls });
  } catch (error) {
    console.error("Failed to get homepage settings:", error);
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await request.json();
    await saveSettings(settings);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Failed to save homepage settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
