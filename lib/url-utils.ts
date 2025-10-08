/**
 * Utility functions for handling S3 URLs and keys
 */

/**
 * Extract S3 key from presigned URL
 * @param url - Presigned URL or S3 key
 * @returns S3 key
 */
export function extractS3Key(url: string): string {
  // If it's already a key (no http), return as is
  if (!url.startsWith("http")) {
    return url;
  }

  // Extract key from presigned URL
  const match = url.match(
    /https:\/\/([^.]+)\.s3\.([^.]+)\.amazonaws\.com\/([^?]+)/
  );
  if (match) {
    const [, , , key] = match;
    return decodeURIComponent(key);
  }

  // If it's a regular S3 URL without query params
  const simpleMatch = url.match(
    /https:\/\/([^.]+)\.s3\.([^.]+)\.amazonaws\.com\/(.+)$/
  );
  if (simpleMatch) {
    const [, , , key] = simpleMatch;
    return decodeURIComponent(key);
  }

  // Return original if no match
  return url;
}

/**
 * Check if URL is a presigned URL
 * @param url - URL to check
 * @returns boolean
 */
export function isPresignedUrl(url: string): boolean {
  return url.includes("X-Amz-Algorithm") || url.includes("X-Amz-Signature");
}

/**
 * Check if URL is an S3 URL (presigned or not)
 * @param url - URL to check
 * @returns boolean
 */
export function isS3Url(url: string): boolean {
  return url.includes(".s3.") && url.includes(".amazonaws.com");
}

/**
 * Check if URL is a public S3 URL (not presigned)
 * @param url - URL to check
 * @returns boolean
 */
export function isPublicS3Url(url: string): boolean {
  return isS3Url(url) && !isPresignedUrl(url);
}

/**
 * Convert presigned URL to public URL by extracting S3 key and generating public URL
 * @param url - Presigned URL or S3 key
 * @param bucketName - S3 bucket name
 * @param region - AWS region
 * @returns Public S3 URL
 */
export function convertToPublicUrl(
  url: string,
  bucketName: string,
  region: string
): string {
  // If it's already a public URL, return as is
  if (isPublicS3Url(url)) {
    return url;
  }

  // If it's not an HTTP URL, treat as S3 key
  if (!url.startsWith("http")) {
    return `https://${bucketName}.s3.${region}.amazonaws.com/${url}`;
  }

  // Extract S3 key and convert to public URL
  const s3Key = extractS3Key(url);
  return `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
}

/**
 * Migrate homepage settings from presigned URLs to public URLs
 * @param settings - Homepage settings object
 * @param bucketName - S3 bucket name
 * @param region - AWS region
 * @returns Migrated settings with public URLs converted to S3 keys
 */
export function migrateHomepageUrlsToKeys(
  settings: any,
  bucketName: string,
  region: string
): any {
  const migratedSettings = { ...settings };

  // Helper function to process URL fields
  const processUrl = (url: string): string => {
    if (!url || !url.startsWith("http")) {
      return url; // Already an S3 key or empty
    }

    // If it's a presigned URL, extract the S3 key
    if (isPresignedUrl(url)) {
      return extractS3Key(url);
    }

    // If it's a public S3 URL, extract the S3 key
    if (isPublicS3Url(url)) {
      return extractS3Key(url);
    }

    // Return as is if not an S3 URL
    return url;
  };

  // Process hero section URLs
  if (migratedSettings.hero) {
    if (migratedSettings.hero.backgroundImage) {
      migratedSettings.hero.backgroundImage = processUrl(
        migratedSettings.hero.backgroundImage
      );
    }
    if (migratedSettings.hero.backgroundVideo) {
      migratedSettings.hero.backgroundVideo = processUrl(
        migratedSettings.hero.backgroundVideo
      );
    }
    if (migratedSettings.hero.logo) {
      migratedSettings.hero.logo = processUrl(migratedSettings.hero.logo);
    }
  }

  // Process about section URLs
  if (migratedSettings.about && migratedSettings.about.image) {
    migratedSettings.about.image = processUrl(migratedSettings.about.image);
  }

  return migratedSettings;
}
