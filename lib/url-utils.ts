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
