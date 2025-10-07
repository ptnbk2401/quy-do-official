"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

interface MediaItem {
  fileName: string;
  url: string;
  type: "image" | "video";
  size: number;
  lastModified: string;
}

export function MediaManager() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDownloading, setBulkDownloading] = useState(false);

  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const router = useRouter();

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await fetch("/api/media");
      const data = await response.json();

      const items: MediaItem[] = await Promise.all(
        (data.files || []).map(
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
            };
          }
        )
      );

      setMedia(items);
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa "${fileName}"?`)) {
      return;
    }

    setDeleting(fileName);

    try {
      const response = await fetch("/api/media/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      // Remove from list
      setMedia(media.filter((m) => m.fileName !== fileName));

      // Refresh to update stats
      router.refresh();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Xóa thất bại. Vui lòng thử lại.");
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedItems.size === 0) return;

    setBulkDownloading(true);

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      const selectedMedia = media.filter((m) => selectedItems.has(m.fileName));

      // Download all files and add to zip
      for (const item of selectedMedia) {
        try {
          // Get presigned download URL
          const response = await fetch("/api/media/download", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName: item.fileName }),
          });

          if (!response.ok) {
            throw new Error("Failed to get download URL");
          }

          const { downloadUrl } = await response.json();

          // Fetch file content
          const fileResponse = await fetch(downloadUrl);
          const blob = await fileResponse.blob();

          // Add to zip with original filename (without path)
          const fileName = item.fileName.split("/").pop() || item.fileName;
          zip.file(fileName, blob);
        } catch (error) {
          console.error(`Failed to download ${item.fileName}:`, error);
        }
      }

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Download zip
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `media-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(
        `Đã tải xuống ${selectedItems.size} file${
          selectedItems.size > 1 ? "s" : ""
        } trong file ZIP!`
      );
    } catch (error) {
      console.error("Bulk download failed:", error);
      alert("Tải xuống thất bại. Vui lòng thử lại.");
    } finally {
      setBulkDownloading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    if (
      !confirm(
        `Bạn có chắc muốn xóa ${selectedItems.size} file${
          selectedItems.size > 1 ? "s" : ""
        }?`
      )
    ) {
      return;
    }

    setBulkDeleting(true);

    try {
      const deletePromises = Array.from(selectedItems).map((fileName) =>
        fetch("/api/media/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName }),
        })
      );

      await Promise.all(deletePromises);

      // Remove from list
      setMedia(media.filter((m) => !selectedItems.has(m.fileName)));
      setSelectedItems(new Set());

      alert(
        `Đã xóa thành công ${selectedItems.size} file${
          selectedItems.size > 1 ? "s" : ""
        }!`
      );

      // Refresh to update stats
      router.refresh();
    } catch (error) {
      console.error("Bulk delete failed:", error);
      alert("Xóa thất bại. Vui lòng thử lại.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelectItem = (fileName: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(fileName)) {
      newSelected.delete(fileName);
    } else {
      newSelected.add(fileName);
    }
    setSelectedItems(newSelected);
  };

  // Filtered and sorted media
  const filteredAndSortedMedia = useMemo(() => {
    const filtered = media.filter((item) => {
      const matchesSearch = item.fileName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      return matchesSearch && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.fileName.localeCompare(b.fileName);
          break;
        case "date":
          comparison =
            new Date(a.lastModified).getTime() -
            new Date(b.lastModified).getTime();
          break;
        case "size":
          comparison = a.size - b.size;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [media, searchTerm, typeFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedMedia.length / itemsPerPage);
  const paginatedMedia = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedMedia.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedMedia, currentPage, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, sortBy, sortOrder]);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Link đã được copy!");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#DA291C]"></div>
        <p className="mt-4 text-gray-400">Loading media...</p>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-12 bg-[#1C1C1C] rounded-lg">
        <svg
          className="mx-auto h-12 w-12 text-gray-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-gray-400 text-lg mb-2">Chưa có media nào</p>
        <p className="text-gray-500 text-sm">
          Upload hình ảnh hoặc video để bắt đầu
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Media Files</h2>
          <p className="text-gray-400 mt-1">
            Tổng: {media.length} files • Hiển thị:{" "}
            {filteredAndSortedMedia.length} files
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-[#1C1C1C] p-6 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Tên file..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#2E2E2E] border border-[#3E3E3E] rounded-lg px-4 py-2 pl-10 text-white focus:border-[#DA291C] focus:outline-none"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
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
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Loại file
            </label>
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as "all" | "image" | "video")
              }
              className="w-full bg-[#2E2E2E] border border-[#3E3E3E] rounded-lg px-4 py-2 text-white focus:border-[#DA291C] focus:outline-none"
            >
              <option value="all">Tất cả</option>
              <option value="image">Hình ảnh</option>
              <option value="video">Video</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sắp xếp theo
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "name" | "date" | "size")
              }
              className="w-full bg-[#2E2E2E] border border-[#3E3E3E] rounded-lg px-4 py-2 text-white focus:border-[#DA291C] focus:outline-none"
            >
              <option value="date">Ngày tạo</option>
              <option value="name">Tên file</option>
              <option value="size">Kích thước</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Thứ tự
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="w-full bg-[#2E2E2E] border border-[#3E3E3E] rounded-lg px-4 py-2 text-white focus:border-[#DA291C] focus:outline-none"
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </div>
        </div>

        {/* Items per page */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Hiển thị:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#2E2E2E] border border-[#3E3E3E] rounded px-3 py-1 text-white focus:border-[#DA291C] focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-300">files/trang</span>
          </div>

          {/* Clear filters */}
          {(searchTerm ||
            typeFilter !== "all" ||
            sortBy !== "date" ||
            sortOrder !== "desc") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setTypeFilter("all");
                setSortBy("date");
                setSortOrder("desc");
              }}
              className="text-sm text-[#DA291C] hover:text-[#FBE122] transition-colors"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <div className="bg-[#1C1C1C] p-4 rounded-lg border border-[#DA291C]/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">
              Đã chọn:{" "}
              <span className="text-[#DA291C] font-semibold">
                {selectedItems.size}
              </span>{" "}
              file
              {selectedItems.size > 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBulkDownload}
                disabled={bulkDownloading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {bulkDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang tạo ZIP...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Tải ZIP
                  </>
                )}
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {bulkDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Xóa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#1C1C1C] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#2E2E2E]">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      paginatedMedia.length > 0 &&
                      paginatedMedia.every((item) =>
                        selectedItems.has(item.fileName)
                      )
                    }
                    onChange={() => {
                      if (
                        paginatedMedia.every((item) =>
                          selectedItems.has(item.fileName)
                        )
                      ) {
                        // Unselect all on current page
                        const newSelected = new Set(selectedItems);
                        paginatedMedia.forEach((item) =>
                          newSelected.delete(item.fileName)
                        );
                        setSelectedItems(newSelected);
                      } else {
                        // Select all on current page
                        const newSelected = new Set(selectedItems);
                        paginatedMedia.forEach((item) =>
                          newSelected.add(item.fileName)
                        );
                        setSelectedItems(newSelected);
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-600 text-[#DA291C] focus:ring-[#DA291C]"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2E2E]">
              {paginatedMedia.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-gray-600 mb-4"
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
                      <p className="text-gray-400 text-lg mb-2">
                        Không tìm thấy file nào
                      </p>
                      <p className="text-gray-500 text-sm mb-4">
                        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setTypeFilter("all");
                          setSortBy("date");
                          setSortOrder("desc");
                        }}
                        className="px-4 py-2 bg-[#DA291C] hover:bg-[#FBE122] hover:text-black text-white rounded-lg transition-colors text-sm"
                      >
                        Xóa bộ lọc
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedMedia.map((item) => (
                  <tr key={item.fileName} className="hover:bg-[#2E2E2E]/50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.fileName)}
                        onChange={() => toggleSelectItem(item.fileName)}
                        className="w-4 h-4 rounded border-gray-600 text-[#DA291C] focus:ring-[#DA291C]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-16 h-16 bg-[#2E2E2E] rounded overflow-hidden">
                        {item.type === "image" ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.url}
                            alt={item.fileName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <svg
                              className="w-8 h-8"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white truncate max-w-xs">
                        {item.fileName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          item.type === "video"
                            ? "bg-purple-900/30 text-purple-400"
                            : "bg-blue-900/30 text-blue-400"
                        }`}
                      >
                        {item.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatFileSize(item.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(item.lastModified)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCopyLink(item.url)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Copy link"
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
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 transition-colors"
                          title="View"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </a>
                        <button
                          onClick={() => handleDelete(item.fileName)}
                          disabled={deleting === item.fileName}
                          className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === item.fileName ? (
                            <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-[#1C1C1C] p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(
                currentPage * itemsPerPage,
                filteredAndSortedMedia.length
              )}{" "}
              trong tổng số {filteredAndSortedMedia.length} files
            </div>

            <div className="flex items-center gap-2">
              {/* Previous button */}
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-[#2E2E2E] hover:bg-[#3E3E3E] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? "bg-[#DA291C] text-white"
                          : "bg-[#2E2E2E] hover:bg-[#3E3E3E] text-white"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next button */}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-[#2E2E2E] hover:bg-[#3E3E3E] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Jump to page */}
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-gray-400">Trang:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = Math.max(
                      1,
                      Math.min(totalPages, parseInt(e.target.value) || 1)
                    );
                    setCurrentPage(page);
                  }}
                  className="w-16 bg-[#2E2E2E] border border-[#3E3E3E] rounded px-2 py-1 text-white text-center focus:border-[#DA291C] focus:outline-none"
                />
                <span className="text-sm text-gray-400">/ {totalPages}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
