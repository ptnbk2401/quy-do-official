import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://quydo.vn"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Quỷ Đỏ Official - Media Hub Manchester United",
    template: "%s | Quỷ Đỏ Official",
  },
  description:
    "Kho lưu trữ hình ảnh, video và khoảnh khắc đáng nhớ của Manchester United. Cộng đồng fan Quỷ Đỏ Việt Nam - Chia sẻ niềm đam mê bóng đá.",
  keywords: [
    "Manchester United",
    "Man Utd",
    "Quỷ Đỏ",
    "MU",
    "Old Trafford",
    "Premier League",
    "Bóng đá Anh",
    "Fan MU Việt Nam",
    "Hình ảnh MU",
    "Video MU",
  ],
  authors: [{ name: "Quỷ Đỏ Official" }],
  creator: "Quỷ Đỏ Official",
  publisher: "Quỷ Đỏ Official",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://quydo.vn",
    siteName: "Quỷ Đỏ Official",
    title: "Quỷ Đỏ Official - Media Hub Manchester United",
    description:
      "Kho lưu trữ hình ảnh, video và khoảnh khắc đáng nhớ của Manchester United",
    images: [
      {
        url: "/images/old-trafford-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Quỷ Đỏ Official - Manchester United",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quỷ Đỏ Official - Media Hub Manchester United",
    description:
      "Kho lưu trữ hình ảnh, video và khoảnh khắc đáng nhớ của Manchester United",
    images: ["/images/old-trafford-hero.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Quỷ Đỏ Official",
    description:
      "Kho lưu trữ hình ảnh, video và khoảnh khắc đáng nhớ của Manchester United",
    url: "https://quydo.vn",
    inLanguage: "vi-VN",
    publisher: {
      "@type": "Organization",
      name: "Quỷ Đỏ Official",
      logo: {
        "@type": "ImageObject",
        url: "https://quydo.vn/favicon.ico",
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://quydo.vn/gallery?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="vi">
      <head>
        {/* Favicons */}
        <link
          rel="icon"
          type="image/png"
          href="/favicon/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}

        {/* Facebook Pixel */}
        {process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}

        {/* Google Search Console Verification */}
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta
            name="google-site-verification"
            content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION}
          />
        )}
      </head>
      <body className={`${beVietnamPro.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
