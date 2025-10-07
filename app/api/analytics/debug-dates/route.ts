import { NextRequest, NextResponse } from "next/server";
import {
  getAnalyticsDateRange,
  getYesterday,
  getToday,
  formatDateForGA,
} from "@/lib/date-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "7d";

  const today = getToday();
  const yesterday = getYesterday();

  const dateRange = getAnalyticsDateRange(range as any);

  return NextResponse.json({
    debug: {
      today: formatDateForGA(today),
      yesterday: formatDateForGA(yesterday),
      selectedRange: range,
      calculatedRange: dateRange,
      timestamp: new Date().toISOString(),
    },
  });
}
