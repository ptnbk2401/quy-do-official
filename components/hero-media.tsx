"use client";

import { useState } from "react";
import Image from "next/image";

interface HeroMediaProps {
  backgroundVideo?: string;
  backgroundImage?: string;
  logo?: string;
  title: string;
}

export function HeroMedia({
  backgroundVideo,
  backgroundImage,
  logo,
  title,
}: HeroMediaProps) {
  const [videoError, setVideoError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <>
      {/* Background Video or Image */}
      {backgroundVideo && !videoError ? (
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => {
              console.error("Video failed to load:", backgroundVideo);
              setVideoError(true);
            }}
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
      ) : backgroundImage && !imageError ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
          }}
          onError={() => {
            console.error("Background image failed to load:", backgroundImage);
            setImageError(true);
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
      ) : (
        // Fallback gradient background
        <div className="absolute inset-0 bg-gradient-to-br from-[#DA291C] via-black to-[#FBE122]">
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
      )}

      {/* Logo with error handling */}
      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#DA291C] to-[#FBE122] rounded-full flex items-center justify-center shadow-2xl shadow-[#DA291C]/50 overflow-hidden">
        {logo && !logoError ? (
          <img
            src={logo}
            alt={`${title} Logo`}
            className="w-full h-full object-contain p-2"
            onError={() => {
              console.error("Logo failed to load:", logo);
              setLogoError(true);
            }}
          />
        ) : (
          <span className="text-6xl">⚽</span>
        )}
      </div>
    </>
  );
}
