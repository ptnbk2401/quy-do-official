"use client";

import { useState, useEffect } from "react";

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

export function HomepageEditor() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "hero" | "about" | "highlights" | "social"
  >("hero");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/homepage");
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch("/api/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("✅ Đã lưu thành công!");
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("❌ Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (
    section: "hero" | "hero-video" | "about" | "logo",
    file: File
  ) => {
    setUploading(section);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("section", section.replace("-video", ""));

      const response = await fetch("/api/homepage/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      // Update settings with new image/video URL
      if (settings) {
        if (section === "hero") {
          setSettings({
            ...settings,
            hero: { ...settings.hero, backgroundImage: data.url },
          });
        } else if (section === "hero-video") {
          setSettings({
            ...settings,
            hero: { ...settings.hero, backgroundVideo: data.url },
          });
        } else if (section === "logo") {
          setSettings({
            ...settings,
            hero: { ...settings.hero, logo: data.url },
          });
        } else {
          setSettings({
            ...settings,
            about: { ...settings.about, image: data.url },
          });
        }
      }

      alert("✅ Đã upload thành công!");
    } catch (error) {
      console.error("Failed to upload:", error);
      alert("❌ Upload thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(null);
    }
  };

  if (loading || !settings) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#DA291C]"></div>
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#2E2E2E]">
        {[
          { id: "hero", label: "Hero Section", icon: "🎯" },
          { id: "about", label: "About Section", icon: "📖" },
          { id: "highlights", label: "Highlights", icon: "⭐" },
          { id: "social", label: "Social Links", icon: "🌐" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === tab.id
                ? "text-[#DA291C] border-b-2 border-[#DA291C]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Hero Section */}
      {activeTab === "hero" && (
        <div className="bg-[#1C1C1C] p-8 rounded-lg space-y-6">
          <h2 className="text-2xl font-bold mb-4">Hero Section</h2>

          {/* Background Video */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Background Video (Priority)
            </label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload("hero-video", file);
                  }}
                  disabled={uploading === "hero-video"}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#DA291C] file:text-white hover:file:bg-[#FBE122] hover:file:text-black"
                />
                <p className="text-xs text-gray-500 mt-1">
                  MP4 or WebM, max 200MB. Video will be used if uploaded,
                  otherwise fallback to image.
                </p>
              </div>
              {settings.hero.backgroundVideo && (
                <div className="w-32 h-32 relative rounded overflow-hidden bg-black">
                  <video
                    src={settings.hero.backgroundVideo}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    autoPlay
                  />
                </div>
              )}
            </div>
            {uploading === "hero-video" && (
              <p className="text-sm text-[#DA291C] mt-2">Uploading...</p>
            )}
          </div>

          {/* Background Image */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Background Image (Fallback)
            </label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload("hero", file);
                  }}
                  disabled={uploading === "hero"}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#DA291C] file:text-white hover:file:bg-[#FBE122] hover:file:text-black"
                />
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, or WebP, max 10MB. Used when no video is uploaded.
                </p>
              </div>
              {settings.hero.backgroundImage && (
                <div className="w-32 h-32 relative rounded overflow-hidden bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={settings.hero.backgroundImage}
                    alt="Hero background"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            {uploading === "hero" && (
              <p className="text-sm text-[#DA291C] mt-2">Uploading...</p>
            )}
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Logo (Center Badge)
            </label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload("logo", file);
                  }}
                  disabled={uploading === "logo"}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#DA291C] file:text-white hover:file:bg-[#FBE122] hover:file:text-black"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: Square image (512x512 or larger). Leave empty to
                  use default soccer ball emoji.
                </p>
              </div>
              {settings.hero.logo && (
                <div className="w-32 h-32 relative rounded-full overflow-hidden bg-gradient-to-br from-[#DA291C] to-[#FBE122] p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={settings.hero.logo}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
            {uploading === "logo" && (
              <p className="text-sm text-[#DA291C] mt-2">Uploading...</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={settings.hero.title}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  hero: { ...settings.hero, title: e.target.value },
                })
              }
              className="w-full bg-[#2E2E2E] border border-[#3E3E3E] rounded-lg px-4 py-3 text-white focus:border-[#DA291C] focus:outline-none"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subtitle
            </label>
            <textarea
              value={settings.hero.subtitle}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  hero: { ...settings.hero, subtitle: e.target.value },
                })
              }
              rows={3}
              className="w-full bg-[#2E2E2E] border border-[#3E3E3E] rounded-lg px-4 py-3 text-white focus:border-[#DA291C] focus:outline-none"
            />
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CTA Text
              </label>
              <input
                type="text"
                value={settings.hero.ctaText}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    hero: { ...settings.hero, ctaText: e.target.value },
                  })
                }
                className="w-full bg-[#2E2E2E] border border-[#3E3E3E] rounded-lg px-4 py-3 text-white focus:border-[#DA291C] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CTA Link
              </label>
              <input
                type="text"
                value={settings.hero.ctaLink}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    hero: { ...settings.hero, ctaLink: e.target.value },
                  })
                }
                className="w-full bg-[#2E2E2E] border border-[#3E3E3E] rounded-lg px-4 py-3 text-white focus:border-[#DA291C] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* About Section */}
      {activeTab === "about" && (
        <div className="bg-[#1C1C1C] p-8 rounded-lg space-y-6">
          <h2 className="text-2xl font-bold mb-4">About Section</h2>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image
            </label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload("about", file);
                  }}
                  disabled={uploading === "about"}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#DA291C] file:text-white hover:file:bg-[#FBE122] hover:file:text-black"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 800x800 (square)
                </p>
              </div>
              {settings.about.image && (
                <div className="w-32 h-32 relative rounded overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={settings.about.image}
                    alt="About image"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            {uploading === "about" && (
              <p className="text-sm text-[#DA291C] mt-2">Uploading...</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={settings.about.title}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  about: { ...settings.about, title: e.target.value },
                })
              }
              className="w-full bg-[#2E2E2E] border border-[#3E3E3E] rounded-lg px-4 py-3 text-white focus:border-[#DA291C] focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={settings.about.description}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  about: { ...settings.about, description: e.target.value },
                })
              }
              rows={5}
              className="w-full bg-[#2E2E2E] border border-[#3E3E3E] rounded-lg px-4 py-3 text-white focus:border-[#DA291C] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Highlights Section */}
      {activeTab === "highlights" && (
        <div className="bg-[#1C1C1C] p-8 rounded-lg space-y-6">
          <h2 className="text-2xl font-bold mb-4">Highlights Section</h2>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.highlights.enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    highlights: {
                      ...settings.highlights,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="w-5 h-5 rounded border-gray-600 text-[#DA291C] focus:ring-[#DA291C]"
              />
              <span>Enable Highlights Section</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of items to show
            </label>
            <input
              type="number"
              min="3"
              max="12"
              value={settings.highlights.limit}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  highlights: {
                    ...settings.highlights,
                    limit: parseInt(e.target.value) || 6,
                  },
                })
              }
              className="w-full bg-[#2E2E2E] border border-[#3E3E3E] rounded-lg px-4 py-3 text-white focus:border-[#DA291C] focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Fetches latest media from gallery
            </p>
          </div>
        </div>
      )}

      {/* Social Links */}
      {activeTab === "social" && (
        <div className="bg-[#1C1C1C] p-8 rounded-lg space-y-6">
          <h2 className="text-2xl font-bold mb-4">Social Links</h2>

          {Object.entries(settings.social).map(([platform, url]) => (
            <div key={platform}>
              <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                {platform}
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    social: { ...settings.social, [platform]: e.target.value },
                  })
                }
                placeholder={`https://${platform}.com/...`}
                className="w-full bg-[#2E2E2E] border border-[#3E3E3E] rounded-lg px-4 py-3 text-white focus:border-[#DA291C] focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-4 pt-6 border-t border-[#2E2E2E]">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[#2E2E2E] hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-[#DA291C] hover:bg-[#FBE122] hover:text-black text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Đang lưu...
            </>
          ) : (
            <>💾 Lưu thay đổi</>
          )}
        </button>
      </div>
    </div>
  );
}
