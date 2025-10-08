import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Return empty traffic data for now
    return NextResponse.json({
      traffic: [],
      totalSessions: 0,
      totalPageviews: 0,
    });
  } catch (error) {
    console.error("Error fetching traffic data:", error);
    return NextResponse.json({
      traffic: [],
      totalSessions: 0,
      totalPageviews: 0,
    });
  }
}
