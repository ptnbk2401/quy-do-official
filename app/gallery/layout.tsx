import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/gallery",
  },
  title: "Gallery - Thư viện Media",
  description:
    "Khám phá bộ sưu tập hình ảnh và video đầy đủ về Manchester United. Lọc theo danh mục, tìm kiếm và xem các khoảnh khắc đáng nhớ.",
  openGraph: {
    title: "Gallery - Thư viện Media | Quỷ Đỏ Official",
    description:
      "Khám phá bộ sưu tập hình ảnh và video đầy đủ về Manchester United",
    type: "website",
    url: "https://quydo.vn/gallery",
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
