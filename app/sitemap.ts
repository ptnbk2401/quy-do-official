import { MetadataRoute } from "next";
import { getAllNews } from "@/lib/news";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://quydo.vn";

  // Get all news articles with error handling
  let news: Array<{ slug: string; metadata: { date: string } }> = [];
  try {
    news = getAllNews();
  } catch (error) {
    console.warn("Failed to load news for sitemap:", error);
    // Continue with empty news array
  }

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  // News article pages
  const newsPages = news
    .filter((post) => post.slug && post.metadata?.date)
    .map((post) => {
      const lastModified = new Date(post.metadata.date);
      // Fallback to current date if invalid
      const validDate = isNaN(lastModified.getTime())
        ? new Date()
        : lastModified;

      return {
        url: `${baseUrl}/news/${post.slug}`,
        lastModified: validDate,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    });

  return [...staticPages, ...newsPages];
}
