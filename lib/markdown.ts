import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface NewsMetadata {
  title: string;
  date: string;
  author: string;
  description: string;
  thumbnail?: string;
  tags?: string[];
}

export interface NewsPost {
  slug: string;
  metadata: NewsMetadata;
  content: string;
}

export function parseMarkdownFile(filePath: string): NewsPost {
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  // Generate slug from filename (remove .md extension)
  const fileName = path.basename(filePath, ".md");
  const slug = fileName;

  return {
    slug,
    metadata: data as NewsMetadata,
    content,
  };
}

export function getMarkdownFiles(directory: string): string[] {
  const fullPath = path.join(process.cwd(), directory);

  // Handle missing directory gracefully
  if (!fs.existsSync(fullPath)) {
    return [];
  }

  try {
    return fs
      .readdirSync(fullPath)
      .filter((file) => file.endsWith(".md"))
      .map((file) => path.join(fullPath, file));
  } catch (error) {
    console.warn(`Error reading directory ${fullPath}:`, error);
    return [];
  }
}
