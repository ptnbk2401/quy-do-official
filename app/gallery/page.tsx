"use client";

import { useState, useEffect, useRef } from "react";
import { MediaCard } from "@/components/gallery/media-card";
import { MediaModal } from "@/components/gallery/media-modal";
import Link from "next/link";

interface MediaItem {
  fileName: string;
  url: string;
  type: "image" | "video" | "embed";
  size: number;
  lastModified: string;
  embedType?: "youtube" | "tiktok";
  category?: string;
}

type FilterType = "all" | "image" | "video" | "embed";

export default function GalleryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(20); // Show 20 items initially
  const [previousDisplayCount, setPreviousDisplayCount] = useState(20); // Track previous count
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      // Fetch S3 media
      const response = await fetch("/api/media");
      const data = await response.json();

      // Check for warnings (AWS not configured)
      if (data.warning) {
        setWarning(data.warning);
      }

      // Transform S3 objects to MediaItem format (exclude homepage settings)
      const s3Items: MediaItem[] = await Promise.all(
        (data.files || [])
          .filter(
            (file: { Key?: string }) => !file.Key?.startsWith("homepage/")
          )
          .map(
            async (file: {
              Key?: string;
              Size?: number;
              LastModified?: string;
            }) => {
              const fileName = file.Key || "";
              const isVideo = /\.(mp4|mov|avi|webm)$/i.test(fileName);

              // Get presigned URL for viewing
              let presignedUrl = "";
              try {
                const urlResponse = await fetch("/api/media/download", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ fileName }),
                });
                if (urlResponse.ok) {
                  const { downloadUrl } = await urlResponse.json();
                  presignedUrl = downloadUrl;
                }
              } catch (error) {
                console.error("Failed to get presigned URL:", error);
              }

              // Extract category from fileName (format: category/timestamp-filename)
              const parts = fileName.split("/");
              const category = parts.length > 1 ? parts[0] : "uncategorized";

              return {
                fileName,
                url:
                  presignedUrl ||
                  `https://${
                    process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME || ""
                  }.s3.${
                    process.env.NEXT_PUBLIC_AWS_REGION || "ap-southeast-1"
                  }.amazonaws.com/${fileName}`,
                type: isVideo ? "video" : "image",
                size: file.Size || 0,
                lastModified: file.LastModified || new Date().toISOString(),
                category,
              };
            }
          )
      );

      // Fetch embeds
      const embedResponse = await fetch("/api/media/embed");
      const embedData = await embedResponse.json();

      const embedItems: MediaItem[] = (embedData.embeds || []).map(
        (embed: {
          title?: string;
          url: string;
          type: "youtube" | "tiktok";
          createdAt: string;
        }) => ({
          fileName: embed.title || embed.url,
          url: embed.url,
          type: "embed" as const,
          size: 0,
          lastModified: embed.createdAt,
          embedType: embed.type,
        })
      );

      // Combine and sort by date
      const allItems = [...s3Items, ...embedItems].sort(
        (a, b) =>
          new Date(b.lastModified).getTime() -
          new Date(a.lastModified).getTime()
      );

      setMedia(allItems);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(s3Items.map((item) => item.category).filter(Boolean))
      ).sort();
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = media.filter((item) => {
    // Filter by type
    if (filter !== "all" && item.type !== filter) {
      return false;
    }

    // Filter by category
    if (categoryFilter !== "all" && item.category !== categoryFilter) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      return item.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  });

  // Paginated media - only show displayCount items
  const displayedMedia = filteredMedia.slice(0, displayCount);
  const hasMore = filteredMedia.length > displayCount;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-[#DA291C]">Media Gallery</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-[#2E2E2E] hover:bg-[#DA291C] rounded-lg transition-colors"
          >
            ← Home
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1C1C1C] border border-[#2E2E2E] rounded-lg px-4 py-3 pl-10 text-white placeholder-gray-500 focus:border-[#DA291C] focus:outline-none"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-8 space-y-4">
          {/* Type Filter */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Loại file:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  filter === "all"
                    ? "bg-[#DA291C]"
                    : "bg-[#2E2E2E] hover:bg-[#DA291C]"
                }`}
              >
                Tất cả ({media.length})
              </button>
              <button
                onClick={() => setFilter("image")}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  filter === "image"
                    ? "bg-[#DA291C]"
                    : "bg-[#2E2E2E] hover:bg-[#DA291C]"
                }`}
              >
                Ảnh ({media.filter((m) => m.type === "image").length})
              </button>
              <button
                onClick={() => setFilter("video")}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  filter === "video"
                    ? "bg-[#DA291C]"
                    : "bg-[#2E2E2E] hover:bg-[#DA291C]"
                }`}
              >
                Video ({media.filter((m) => m.type === "video").length})
              </button>
              <button
                onClick={() => setFilter("embed")}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  filter === "embed"
                    ? "bg-[#DA291C]"
                    : "bg-[#2E2E2E] hover:bg-[#DA291C]"
                }`}
              >
                TikTok/YouTube ({media.filter((m) => m.type === "embed").length}
                )
              </button>
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Danh mục:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    categoryFilter === "all"
                      ? "bg-[#DA291C]"
                      : "bg-[#2E2E2E] hover:bg-[#DA291C]"
                  }`}
                >
                  Tất cả
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-6 py-2 rounded-lg transition-colors capitalize ${
                      categoryFilter === cat
                        ? "bg-[#DA291C]"
                        : "bg-[#2E2E2E] hover:bg-[#DA291C]"
                    }`}
                  >
                    {cat.replace(/-/g, " ")} (
                    {media.filter((m) => m.category === cat).length})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AWS Configuration Warning */}
        {warning && (
          <div className="mb-8 p-6 bg-yellow-900/20 border border-yellow-500 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-yellow-500 font-semibold mb-1">
                  AWS S3 Not Configured
                </p>
                <p className="text-yellow-200 text-sm">{warning}</p>
                <p className="text-yellow-200 text-sm mt-2">
                  Check{" "}
                  <code className="bg-black/30 px-2 py-1 rounded">
                    QUICK_START.md
                  </code>{" "}
                  for setup instructions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#DA291C]"></div>
            <p className="mt-4 text-gray-400">Loading media...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredMedia.length === 0 && (
          <div className="text-center py-20">
            <svg
              className="mx-auto h-24 w-24 text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-400 text-lg">No media found</p>
            <p className="text-gray-500 text-sm mt-2">
              Upload some media to get started
            </p>
          </div>
        )}

        {/* Media Grid - Masonry Layout */}
        {!loading && displayedMedia.length > 0 && (
          <>
            <div className="masonry-grid">
              {displayedMedia.map((item, index) => {
                // Eager load newly added items (after "Load More" click)
                const isNewItem = index >= previousDisplayCount;
                return (
                  <div
                    key={`${item.fileName}-${index}`}
                    className="masonry-item"
                  >
                    <MediaCard
                      fileName={item.fileName}
                      url={item.url}
                      type={item.type}
                      embedType={item.embedType}
                      onClick={() => setSelectedMedia(item)}
                      eager={isNewItem}
                    />
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div ref={loadMoreRef} className="text-center mt-12">
                <button
                  onClick={() => {
                    setPreviousDisplayCount(displayCount);
                    setDisplayCount((prev) => prev + 20);
                    // Don't scroll - let user stay at current position
                    // New images will load eagerly (not lazy)
                  }}
                  className="bg-[#DA291C] hover:bg-[#FBE122] hover:text-black text-white px-8 py-4 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
                >
                  Xem thêm ({filteredMedia.length - displayCount} còn lại)
                </button>
              </div>
            )}
          </>
        )}

        {/* Media Modal */}
        {selectedMedia && (
          <MediaModal
            isOpen={!!selectedMedia}
            onClose={() => setSelectedMedia(null)}
            fileName={selectedMedia.fileName}
            url={selectedMedia.url}
            type={selectedMedia.type}
            embedType={selectedMedia.embedType}
          />
        )}
      </div>
    </div>
  );
}
