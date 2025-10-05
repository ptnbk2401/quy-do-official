"use client"

import { motion } from "framer-motion"

interface MediaGridProps {
  items?: number
}

export function MediaGrid({ items = 8 }: MediaGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: items }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="aspect-square bg-[#2E2E2E] rounded-lg overflow-hidden cursor-pointer group"
        >
          <div className="w-full h-full flex items-center justify-center text-gray-500 group-hover:bg-[#DA291C]/20 transition-colors">
            Media {index + 1}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
