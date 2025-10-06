"use client";

import { motion } from "framer-motion";

import { useState } from "react";

interface MediaCardProps {
  fileName: string;
  url: string;
  type: "image" | "video" | "embed";
  onClick: () => void;
  embedType?: "youtube" | "tiktok";
  eager?: boolean; // Eager load instead of lazy
}

export function MediaCard({
  fileName,
  url,
  type,
  onClick,
  embedType,
  eager = false,
}: MediaCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="relative cursor-pointer group"
      onClick={onClick}
    >
      {type === "embed" ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#DA291C]/20 to-[#2E2E2E]">
          <svg
            className="w-16 h-16 text-[#DA291C] mb-2"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
          </svg>
          <p className="text-xs text-center text-gray-400 uppercase font-semibold">
            {embedType === "youtube" ? "YouTube" : "TikTok"}
          </p>
        </div>
      ) : type === "image" && !imageError ? (
        <div
          className={`rounded-lg overflow-hidden ${
            !imageLoaded ? "shimmer-wrapper" : ""
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={fileName}
            className={`w-full h-auto block ${
              imageLoaded ? "image-loaded" : "image-loading"
            }`}
            onError={() => setImageError(true)}
            onLoad={() => setImageLoaded(true)}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={eager ? "high" : "low"}
          />
        </div>
      ) : type === "video" ? (
        <video
          src={url}
          className="w-full h-auto block rounded-lg"
          muted
          loop
          preload="none"
          onMouseEnter={(e) => {
            e.currentTarget.load();
            e.currentTarget.play();
          }}
          onMouseLeave={(e) => {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          <svg
            className="w-16 h-16"
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
        </div>
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
        <div className="text-white text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <svg
            className="w-10 h-10 mx-auto mb-2"
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
          <p className="text-sm font-semibold">Xem chi tiết</p>
        </div>
      </div>

      {/* Type badge */}
      <div className="absolute top-3 right-3 bg-[#DA291C] px-3 py-1 rounded-full text-xs font-bold shadow-lg">
        {type === "embed"
          ? embedType?.toUpperCase()
          : type === "video"
          ? "VIDEO"
          : "IMAGE"}
      </div>
    </motion.div>
  );
}
