import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPublicUrl } from "@/lib/s3";
import { extractS3Key, migrateHomepageUrlsToKeys } from "@/lib/url-utils";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const SETTINGS_KEY = "config/homepage.json";

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
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: SETTINGS_KEY,
    });

    const response = await s3Client.send(command);
    const data = await response.Body?.transformToString();

    if (data) {
      const settings = JSON.parse(data);

      // Migrate any presigned URLs to S3 keys
      const migratedSettings = migrateHomepageUrlsToKeys(
        settings,
        BUCKET_NAME,
        process.env.AWS_REGION!
      );

      // Save migrated settings if there were changes
      if (JSON.stringify(settings) !== JSON.stringify(migratedSettings)) {
        console.log("Migrating homepage settings from URLs to S3 keys");
        await saveSettings(migratedSettings);
      }

      return migratedSettings;
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.log("Settings not found in S3, using defaults:", error);
    return DEFAULT_SETTINGS;
  }
}

async function saveSettings(settings: HomepageSettings) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: SETTINGS_KEY,
    Body: JSON.stringify(settings, null, 2),
    ContentType: "application/json",
  });

  await s3Client.send(command);
}

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const settings = await getSettings();

    // Convert S3 keys to public URLs for display
    const settingsWithUrls = convertKeysToUrls(settings);

    return NextResponse.json({ settings: settingsWithUrls });
  } catch (error) {
    console.error("Failed to get homepage settings:", error);
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }
}

function convertKeysToUrls(settings: HomepageSettings): HomepageSettings {
  const convertedSettings = { ...settings };

  try {
    // Convert hero images/videos if they are S3 keys (not full URLs)
    if (
      settings.hero.backgroundImage &&
      !settings.hero.backgroundImage.startsWith("http")
    ) {
      convertedSettings.hero.backgroundImage = getPublicUrl(
        settings.hero.backgroundImage
      );
    }

    if (
      settings.hero.backgroundVideo &&
      !settings.hero.backgroundVideo.startsWith("http")
    ) {
      convertedSettings.hero.backgroundVideo = getPublicUrl(
        settings.hero.backgroundVideo
      );
    }

    if (settings.hero.logo && !settings.hero.logo.startsWith("http")) {
      convertedSettings.hero.logo = getPublicUrl(settings.hero.logo);
    }

    if (settings.about.image && !settings.about.image.startsWith("http")) {
      convertedSettings.about.image = getPublicUrl(settings.about.image);
    }
  } catch (error) {
    console.error("Failed to generate public URLs:", error);
    // Return original settings if URL generation fails
    return settings;
  }

  return convertedSettings;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await request.json();

    // Convert any presigned URLs back to S3 keys before saving
    const settingsWithKeys = convertUrlsToKeys(settings);

    await saveSettings(settingsWithKeys);
    return NextResponse.json({ success: true, settings: settingsWithKeys });
  } catch (error) {
    console.error("Failed to save homepage settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}

function convertUrlsToKeys(settings: HomepageSettings): HomepageSettings {
  return {
    ...settings,
    hero: {
      ...settings.hero,
      backgroundImage: extractS3Key(settings.hero.backgroundImage),
      backgroundVideo: extractS3Key(settings.hero.backgroundVideo),
      logo: extractS3Key(settings.hero.logo),
    },
    about: {
      ...settings.about,
      image: extractS3Key(settings.about.image),
    },
  };
}
