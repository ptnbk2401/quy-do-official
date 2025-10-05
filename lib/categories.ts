// Category management utilities

export interface Category {
  id: string;
  name: string;
  count: number;
  createdAt: string;
}

export interface MediaMetadata {
  fileName: string;
  s3Key: string;
  category: string;
  uploadDate: string;
  size: number;
  type: "image" | "video";
  description?: string;
}

// Get categories from metadata
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch("/api/media/categories");
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

// Add new category
export async function addCategory(name: string): Promise<boolean> {
  try {
    const response = await fetch("/api/media/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to add category:", error);
    return false;
  }
}

// Normalize category name (lowercase, no spaces)
export function normalizeCategoryName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// Format category for display
export function formatCategoryName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
