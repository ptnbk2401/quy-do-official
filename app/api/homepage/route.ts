import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generatePresignedDownloadUrl, getPublicUrl } from "@/lib/s3";
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
      return JSON.parse(data);
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

export const revalidate = 3600; // Cache for 1 hour (refresh URLs more frequently)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get("refresh") === "true";
  try {
    const settings = await getSettings();

    // Return settings as-is, client will handle URL refresh if needed
    return NextResponse.json({ settings });
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
