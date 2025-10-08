import { getAllNews } from "@/lib/news";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";

export const metadata: Metadata = {
  title: "Tin tức CLB",
  description:
    "Cập nhật tin tức mới nhất từ CLB. Theo dõi các hoạt động, trận đấu và sự kiện của câu lạc bộ.",
  openGraph: {
    title: "Tin tức CLB",
    description:
      "Cập nhật tin tức mới nhất từ CLB. Theo dõi các hoạt động, trận đấu và sự kiện của câu lạc bộ.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tin tức CLB",
    description:
      "Cập nhật tin tức mới nhất từ CLB. Theo dõi các hoạt động, trận đấu và sự kiện của câu lạc bộ.",
  },
};

export default function NewsPage() {
  const news = getAllNews();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#1C1C1C] to-black py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Breadcrumb
            items={[{ label: "Trang chủ", href: "/" }, { label: "Tin tức" }]}
          />
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            📰 Tin tức <span className="text-[#DA291C]">CLB</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Cập nhật tin tức mới nhất, thông tin trận đấu và hoạt động của câu
            lạc bộ
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {news.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📰</div>
            <h2 className="text-2xl font-bold mb-4">Chưa có tin tức nào</h2>
            <p className="text-gray-400 text-lg">
              Hãy quay lại sau để xem những tin tức mới nhất từ CLB
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {news.map((post) => (
              <article
                key={post.slug}
                className="group border-b border-gray-800 pb-12 last:border-b-0"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* Thumbnail */}
                  {post.metadata.thumbnail && (
                    <div className="lg:col-span-1">
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <Image
                          src={post.metadata.thumbnail}
                          alt={post.metadata.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div
                    className={
                      post.metadata.thumbnail
                        ? "lg:col-span-2"
                        : "lg:col-span-3"
                    }
                  >
                    {/* Meta */}
                    <div className="flex items-center text-[#DA291C] text-sm mb-4">
                      <time dateTime={post.metadata.date}>
                        {new Date(post.metadata.date).toLocaleDateString(
                          "vi-VN",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </time>
                      {post.metadata.author && (
                        <>
                          <span className="mx-3">•</span>
                          <span>{post.metadata.author}</span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
                      <Link
                        href={`/news/${post.slug}`}
                        className="hover:text-[#DA291C] transition-colors"
                      >
                        {post.metadata.title}
                      </Link>
                    </h2>

                    {/* Description */}
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      {post.metadata.description}
                    </p>

                    {/* Tags */}
                    {post.metadata.tags && post.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {post.metadata.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-[#DA291C]/20 text-[#DA291C] text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Read More */}
                    <Link
                      href={`/news/${post.slug}`}
                      className="inline-flex items-center text-[#DA291C] hover:text-[#FBE122] font-semibold transition-colors group"
                    >
                      Đọc bài viết đầy đủ
                      <svg
                        className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
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
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-16 pt-12 border-t border-gray-800">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-[#DA291C] transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
