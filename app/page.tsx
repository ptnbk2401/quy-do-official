"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { SocialIcons } from "@/components/social-icons";

interface HomepageSettings {
  hero: {
    backgroundImage: string;
    backgroundVideo: string;
    logo: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
  };
  about: {
    image: string;
    title: string;
    description: string;
  };
  highlights: {
    enabled: boolean;
    limit: number;
  };
  social: {
    tiktok: string;
    youtube: string;
    facebook: string;
    instagram: string;
  };
}

export default function LandingPage() {
  const [latestMedia, setLatestMedia] = useState<any[]>([]);
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch homepage settings first
    fetch("/api/homepage")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data.settings);

        // Then fetch media with the limit from settings
        const limit = data.settings?.highlights?.limit || 6;

        fetch("/api/media")
          .then((res) => res.json())
          .then((mediaData) => {
            const files = mediaData.files || [];
            // Filter out homepage settings images
            const highlightMedia = files.filter(
              (file: any) => !file.Key?.startsWith("homepage/")
            );
            // Shuffle array randomly
            const shuffled = highlightMedia.sort(() => Math.random() - 0.5);
            // Use limit from settings
            setLatestMedia(shuffled.slice(0, limit));
          })
          .catch((err) => console.error("Failed to fetch media:", err));
      })
      .catch((err) => console.error("Failed to fetch homepage settings:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#DA291C] mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Preload hero media for faster loading */}
      {settings.hero.backgroundVideo && (
        <link rel="preload" as="video" href={settings.hero.backgroundVideo} />
      )}
      {settings.hero.backgroundImage && !settings.hero.backgroundVideo && (
        <link rel="preload" as="image" href={settings.hero.backgroundImage} />
      )}
      {settings.hero.logo && (
        <link rel="preload" as="image" href={settings.hero.logo} />
      )}

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video or Image (Video has priority) */}
        {settings.hero.backgroundVideo ? (
          <div className="absolute inset-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={settings.hero.backgroundVideo} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
        ) : settings.hero.backgroundImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${settings.hero.backgroundImage}')`,
            }}
          >
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black">
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
        )}

        {/* Animated Particles */}
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            backgroundImage:
              "radial-gradient(circle, #DA291C 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            opacity: 0.1,
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Logo/Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#DA291C] to-[#FBE122] rounded-full flex items-center justify-center shadow-2xl shadow-[#DA291C]/50 overflow-hidden">
              {settings.hero.logo ? (
                <img
                  src={settings.hero.logo}
                  alt="Logo"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <span className="text-6xl">⚽</span>
              )}
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {settings.hero.title.split(" ").map((word, index, array) => (
              <span
                key={index}
                className={
                  index === array.length - 1 ? "text-white" : "text-[#DA291C]"
                }
              >
                {word}{" "}
              </span>
            ))}
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-200 mb-12 max-w-2xl mx-auto font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {settings.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <Link
              href={settings.hero.ctaLink}
              className="group relative inline-block bg-[#DA291C] hover:bg-[#FBE122] text-white hover:text-black px-10 py-5 rounded-lg text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#FBE122]/50"
            >
              <span className="flex items-center gap-2">
                🔥 {settings.hero.ctaText}
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </Link>
            <a
              href={settings.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 bg-[#2E2E2E] hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 text-white px-10 py-5 rounded-lg text-lg font-bold transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              <div className="w-6 h-6">
                <SocialIcons.TikTok />
              </div>
              <span>Theo dõi TikTok</span>
            </a>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg
            className="w-6 h-6 text-[#DA291C]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </section>

      {/* Latest Highlights */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-[#DA291C]">Khoảnh khắc</span> Nổi bật
            </h2>
            <p className="text-gray-400 text-lg">
              Những hình ảnh và video đáng nhớ nhất
            </p>
          </motion.div>

          <div className="masonry-grid">
            {latestMedia.length > 0
              ? latestMedia.map((item, index) => {
                  const isImage = item.Key?.match(
                    /\.(jpg|jpeg|png|gif|webp)$/i
                  );
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="masonry-item group relative cursor-pointer"
                    >
                      {/* Image */}
                      {isImage && item.url && (
                        <img
                          src={item.url}
                          alt={item.Key?.split("/").pop() || "Media"}
                          className="w-full h-auto block rounded-lg"
                          loading="lazy"
                        />
                      )}
                      {/* Video */}
                      {!isImage && item.url && (
                        <video
                          src={item.url}
                          className="w-full h-auto block rounded-lg"
                          muted
                          loop
                          preload="none"
                        />
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                      {/* Play icon for videos */}
                      {!isImage && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30">
                          <div className="bg-[#DA291C] rounded-full p-4">
                            <svg
                              className="w-8 h-8 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              : // Placeholder cards when no media
                Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="relative aspect-square bg-gradient-to-br from-[#1C1C1C] to-[#2E2E2E] rounded-lg overflow-hidden"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-600">
                          <div className="text-6xl mb-4">
                            {index % 3 === 0
                              ? "⚽"
                              : index % 3 === 1
                              ? "🏆"
                              : "📸"}
                          </div>
                          <p className="text-sm">Coming Soon</p>
                        </div>
                      </div>
                      {/* Subtle pattern */}
                      <div
                        className="absolute inset-0 opacity-5"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)",
                        }}
                      ></div>
                    </motion.div>
                  ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              href="/gallery"
              className="inline-block bg-[#2E2E2E] hover:bg-[#DA291C] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
            >
              Xem tất cả khoảnh khắc →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About / Story */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden relative shadow-2xl">
                <Image
                  src={settings.about.image}
                  alt="Manchester United Fans"
                  width={800}
                  height={800}
                  className="object-cover w-full h-full"
                  priority
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {settings.about.title.split(" ").map((word, index) =>
                  word === "chúng" || word === "tôi" ? (
                    <span key={index} className="text-[#DA291C]">
                      {word}{" "}
                    </span>
                  ) : (
                    <span key={index}>{word} </span>
                  )
                )}
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                {settings.about.description}
              </p>
              <div className="flex gap-4">
                <div className="flex-1 bg-[#1C1C1C] p-6 rounded-lg border border-[#DA291C]/20">
                  <h3 className="text-3xl font-bold text-[#DA291C] mb-2">
                    500+
                  </h3>
                  <p className="text-gray-400">Hình ảnh</p>
                </div>
                <div className="flex-1 bg-[#1C1C1C] p-6 rounded-lg border border-[#DA291C]/20">
                  <h3 className="text-3xl font-bold text-[#DA291C] mb-2">
                    200+
                  </h3>
                  <p className="text-gray-400">Video</p>
                </div>
                <div className="flex-1 bg-[#1C1C1C] p-6 rounded-lg border border-[#DA291C]/20">
                  <h3 className="text-3xl font-bold text-[#DA291C] mb-2">
                    10K+
                  </h3>
                  <p className="text-gray-400">Fans</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Section */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Kết nối cùng <span className="text-[#DA291C]">Quỷ Đỏ</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Theo dõi chúng tôi trên các nền tảng
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "TikTok",
                Icon: SocialIcons.TikTok,
                url: settings.social.tiktok,
                color: "from-pink-500 to-purple-500",
              },
              {
                name: "YouTube",
                Icon: SocialIcons.YouTube,
                url: settings.social.youtube,
                color: "from-red-500 to-red-700",
              },
              {
                name: "Facebook",
                Icon: SocialIcons.Facebook,
                url: settings.social.facebook,
                color: "from-blue-500 to-blue-700",
              },
              {
                name: "Instagram",
                Icon: SocialIcons.Instagram,
                url: settings.social.instagram,
                color: "from-purple-500 to-pink-500",
              },
            ].map((social, index) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-[#1C1C1C] hover:bg-[#2E2E2E] p-8 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${social.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`}
                ></div>
                <div className="text-center">
                  <div className="text-white mb-4 flex justify-center">
                    <social.Icon />
                  </div>
                  <p className="text-white font-semibold">{social.name}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-20 bg-gradient-to-br from-[#DA291C] to-black relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Trở thành một phần của{" "}
              <span className="text-[#FBE122]">Quỷ Đỏ Official</span>
            </h2>
            <p className="text-xl text-gray-200 mb-10">
              Chia sẻ khoảnh khắc Manchester United của bạn cùng hàng ngàn fan
              hâm mộ khác
            </p>
            <Link
              href="/gallery"
              className="inline-block bg-[#FBE122] hover:bg-white text-black px-12 py-6 rounded-lg text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              Tham gia ngay →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-[#2E2E2E]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-[#DA291C] mb-4">
                Quỷ Đỏ Official
              </h3>
              <p className="text-gray-400">
                Nơi lưu giữ khoảnh khắc đáng nhớ của Manchester United
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/gallery"
                    className="text-gray-400 hover:text-[#DA291C] transition-colors"
                  >
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gallery?filter=image"
                    className="text-gray-400 hover:text-[#DA291C] transition-colors"
                  >
                    Hình ảnh
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gallery?filter=video"
                    className="text-gray-400 hover:text-[#DA291C] transition-colors"
                  >
                    Video
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gallery?filter=embed"
                    className="text-gray-400 hover:text-[#DA291C] transition-colors"
                  >
                    TikTok/YouTube
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Theo dõi</h3>
              <div className="flex gap-4 items-center">
                <a
                  href={settings.social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#DA291C] transition-colors"
                >
                  <div className="w-6 h-6">
                    <SocialIcons.TikTok />
                  </div>
                </a>
                <a
                  href={settings.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#DA291C] transition-colors"
                >
                  <div className="w-6 h-6">
                    <SocialIcons.YouTube />
                  </div>
                </a>
                <a
                  href={settings.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#DA291C] transition-colors"
                >
                  <div className="w-6 h-6">
                    <SocialIcons.Facebook />
                  </div>
                </a>
                <a
                  href={settings.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#DA291C] transition-colors"
                >
                  <div className="w-6 h-6">
                    <SocialIcons.Instagram />
                  </div>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-[#2E2E2E] pt-8 text-center text-gray-400">
            <p className="mb-2">
              © 2025 Quỷ Đỏ Official. Glory Glory Man United! 🔴⚫
            </p>
            <p className="text-sm text-gray-500">
              Fan project, not affiliated with Manchester United FC.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
