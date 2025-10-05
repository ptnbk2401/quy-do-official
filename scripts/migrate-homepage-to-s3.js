#!/usr/bin/env node

/**
 * Script to migrate homepage.json from local filesystem to S3
 * Run: node scripts/migrate-homepage-to-s3.js
 */

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

// Load .env.local manually
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const SETTINGS_KEY = "config/homepage.json";
const LOCAL_FILE = path.join(__dirname, "../data/homepage.json");

// Extract S3 key from presigned URL
function extractS3Key(url) {
  if (!url || !url.includes("amazonaws.com")) {
    return url; // Return as-is if not S3 URL
  }

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    // Remove leading slash
    return pathname.substring(1);
  } catch (error) {
    console.error("Failed to parse URL:", url);
    return url;
  }
}

async function migrate() {
  console.log("🚀 Starting migration...\n");

  // Check if local file exists
  if (!fs.existsSync(LOCAL_FILE)) {
    console.error("❌ Local file not found:", LOCAL_FILE);
    process.exit(1);
  }

  // Read local data
  console.log("📖 Reading local file:", LOCAL_FILE);
  const rawData = fs.readFileSync(LOCAL_FILE, "utf-8");
  const data = JSON.parse(rawData);

  // Convert presigned URLs to S3 keys
  console.log("\n🔄 Converting presigned URLs to S3 keys...");
  const cleanData = {
    hero: {
      backgroundImage: extractS3Key(data.hero.backgroundImage),
      backgroundVideo: extractS3Key(data.hero.backgroundVideo),
      logo: extractS3Key(data.hero.logo),
      title: data.hero.title,
      subtitle: data.hero.subtitle,
      ctaText: data.hero.ctaText,
      ctaLink: data.hero.ctaLink,
    },
    about: {
      image: extractS3Key(data.about.image),
      title: data.about.title,
      description: data.about.description,
    },
    highlights: data.highlights,
    social: data.social,
  };

  console.log("\n📝 Cleaned data:");
  console.log(JSON.stringify(cleanData, null, 2));

  // Upload to S3
  console.log("\n☁️  Uploading to S3...");
  console.log(`   Bucket: ${BUCKET_NAME}`);
  console.log(`   Key: ${SETTINGS_KEY}`);

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: SETTINGS_KEY,
      Body: JSON.stringify(cleanData, null, 2),
      ContentType: "application/json",
    });

    await s3Client.send(command);

    console.log("\n✅ Migration successful!");
    console.log(`\n📍 Settings saved to: s3://${BUCKET_NAME}/${SETTINGS_KEY}`);
    console.log("\n🎉 You can now deploy the updated code to Vercel!");
  } catch (error) {
    console.error("\n❌ Failed to upload to S3:");
    console.error(error);
    process.exit(1);
  }
}

// Run migration
migrate().catch((error) => {
  console.error("\n❌ Migration failed:");
  console.error(error);
  process.exit(1);
});
