import { getMarkdownFiles, parseMarkdownFile, NewsPost } from "./markdown";

export function getAllNews(): NewsPost[] {
  const newsFiles = getMarkdownFiles("content/news");

  const posts: NewsPost[] = [];

  for (const filePath of newsFiles) {
    try {
      const post = parseMarkdownFile(filePath);
      posts.push(post);
    } catch (error) {
      console.warn(`Error parsing file ${filePath}:`, error);
      // Skip invalid files but continue processing others
    }
  }

  // Sort by date descending (newest first)
  return posts.sort((a, b) => {
    const dateA = new Date(a.metadata.date);
    const dateB = new Date(b.metadata.date);
    return dateB.getTime() - dateA.getTime();
  });
}

export function getNewsBySlug(slug: string): NewsPost | null {
  const newsFiles = getMarkdownFiles("content/news");

  for (const filePath of newsFiles) {
    try {
      const post = parseMarkdownFile(filePath);
      if (post.slug === slug) {
        return post;
      }
    } catch (error) {
      console.warn(`Error parsing file ${filePath}:`, error);
      // Continue searching other files
    }
  }

  return null;
}

export function getRelatedNews(
  currentSlug: string,
  limit: number = 3
): NewsPost[] {
  const allNews = getAllNews();

  return allNews.filter((post) => post.slug !== currentSlug).slice(0, limit);
}
