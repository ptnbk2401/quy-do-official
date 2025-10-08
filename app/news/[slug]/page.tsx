import { getNewsBySlug, getRelatedNews } from "@/lib/news";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getNewsBySlug(slug);

  if (!post) {
    return {
      title: "Bài viết không tồn tại",
      description: "Bài viết bạn đang tìm kiếm không tồn tại.",
    };
  }

  return {
    title: post.metadata.title,
    description: post.metadata.description,
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description,
      type: "article",
      publishedTime: post.metadata.date,
      authors: post.metadata.author ? [post.metadata.author] : undefined,
      images: post.metadata.thumbnail
        ? [
            {
              url: post.metadata.thumbnail,
              alt: post.metadata.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.metadata.title,
      description: post.metadata.description,
      images: post.metadata.thumbnail ? [post.metadata.thumbnail] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getNewsBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedNews = getRelatedNews(slug, 3);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#1C1C1C] to-black py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Tin tức", href: "/news" },
              { label: post.metadata.title },
            ]}
          />
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Article Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {post.metadata.title}
          </h1>

          <div className="flex items-center text-[#DA291C] text-lg mb-8">
            <time dateTime={post.metadata.date}>
              {new Date(post.metadata.date).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {post.metadata.author && (
              <>
                <span className="mx-3">•</span>
                <span>Tác giả: {post.metadata.author}</span>
              </>
            )}
          </div>

          {post.metadata.description && (
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8 font-light">
              {post.metadata.description}
            </p>
          )}

          {post.metadata.tags && post.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-8">
              {post.metadata.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-[#DA291C]/20 text-[#DA291C] text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {post.metadata.thumbnail && (
            <div className="relative w-full h-64 md:h-96 lg:h-[500px] mb-12 rounded-xl overflow-hidden">
              <Image
                src={post.metadata.thumbnail}
                alt={post.metadata.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg prose-invert max-w-none">
            <ReactMarkdown
              components={{
                img: ({ src, alt }) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={typeof src === "string" ? src : ""}
                    alt={alt || ""}
                    className="w-full h-auto rounded-lg my-8 object-cover"
                  />
                ),
                h1: ({ children }) => (
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 mt-12">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 mt-10">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4 mt-8">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="text-gray-300 text-lg leading-relaxed mb-6 pl-6">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="text-gray-300 text-lg leading-relaxed mb-6 pl-6">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="mb-2">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#DA291C] pl-6 my-8 text-gray-300 text-lg italic">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-8">
                    <table className="w-full border-collapse border border-gray-700">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-gray-700 px-4 py-2 bg-[#DA291C] text-white font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-gray-700 px-4 py-2 text-gray-300">
                    {children}
                  </td>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedNews.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 mt-16 pt-12 border-t border-gray-800">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Bài viết <span className="text-[#DA291C]">liên quan</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedNews.map((relatedPost) => (
              <article
                key={relatedPost.slug}
                className="group bg-[#1C1C1C] rounded-xl overflow-hidden hover:bg-[#2E2E2E] transition-all duration-300"
              >
                {relatedPost.metadata.thumbnail && (
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image
                      src={relatedPost.metadata.thumbnail}
                      alt={relatedPost.metadata.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-bold mb-3 line-clamp-2 group-hover:text-[#DA291C] transition-colors">
                    <Link href={`/news/${relatedPost.slug}`}>
                      {relatedPost.metadata.title}
                    </Link>
                  </h3>
                  <p className="text-[#DA291C] text-sm mb-2">
                    {new Date(relatedPost.metadata.date).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {relatedPost.metadata.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Back Navigation */}
      <div className="max-w-4xl mx-auto px-4 mt-16 pt-12 border-t border-gray-800">
        <div className="flex justify-between items-center">
          <Link
            href="/news"
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
            Về trang tin tức
          </Link>
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-[#DA291C] transition-colors"
          >
            Về trang chủ
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Bottom Spacing */}
      <div className="pb-16"></div>
    </div>
  );
}
