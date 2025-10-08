import { getAllNews } from "@/lib/news";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const news = getAllNews();
    return NextResponse.json({ news });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ news: [] });
  }
}
