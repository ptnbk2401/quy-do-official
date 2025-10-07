/**
 * Cache utilities for analytics data
 */

// In-memory cache for development (in production, use Redis or similar)
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: string; // Custom cache key
}

/**
 * Generate cache key from parameters
 */
export function generateCacheKey(
  endpoint: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return `analytics:${endpoint}:${sortedParams}`;
}

/**
 * Get data from cache
 */
export function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);

  if (!cached) {
    return null;
  }

  // Check if cache has expired
  const now = Date.now();
  if (now - cached.timestamp > cached.ttl * 1000) {
    cache.delete(key);
    return null;
  }

  return cached.data as T;
}

/**
 * Set data in cache
 */
export function setInCache<T>(key: string, data: T, ttl: number = 300): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * Clear cache by pattern
 */
export function clearCacheByPattern(pattern: string): void {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear all analytics cache
 */
export function clearAnalyticsCache(): void {
  clearCacheByPattern("analytics:");
}

/**
 * Get cache stats
 */
export function getCacheStats() {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;

  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > value.ttl * 1000) {
      expiredEntries++;
    } else {
      validEntries++;
    }
  }

  return {
    totalEntries: cache.size,
    validEntries,
    expiredEntries,
    memoryUsage: JSON.stringify([...cache.entries()]).length,
  };
}

/**
 * Cleanup expired cache entries
 */
export function cleanupExpiredCache(): void {
  const now = Date.now();

  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > value.ttl * 1000) {
      cache.delete(key);
    }
  }
}

// Auto cleanup every 5 minutes
if (typeof window === "undefined") {
  // Server-side only
  setInterval(cleanupExpiredCache, 5 * 60 * 1000);
}
