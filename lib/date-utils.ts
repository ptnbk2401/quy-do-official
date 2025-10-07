/**
 * Date utilities for analytics dashboard
 */

/**
 * Get yesterday's date (GA data has 1-day delay)
 */
export function getYesterday(): Date {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0); // Start of day
  return yesterday;
}

/**
 * Get today's date
 */
export function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of day
  return today;
}

/**
 * Format date as YYYY-MM-DD for GA API
 */
export function formatDateForGA(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get date range for analytics queries
 */
export function getAnalyticsDateRange(
  range: "7d" | "30d" | "90d" | "custom",
  customStart?: Date,
  customEnd?: Date
): { startDate: string; endDate: string } {
  let endDate = getYesterday(); // Default to yesterday
  let startDate = new Date();

  switch (range) {
    case "7d":
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 6); // 7 days including end date
      break;
    case "30d":
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 29); // 30 days including end date
      break;
    case "90d":
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 89); // 90 days including end date
      break;
    case "custom":
      if (customStart && customEnd) {
        startDate = new Date(customStart);
        endDate = new Date(customEnd);

        // Ensure custom end date is not later than yesterday
        const yesterday = getYesterday();
        if (endDate > yesterday) {
          endDate = yesterday;
        }
      }
      break;
  }

  const result = {
    startDate: formatDateForGA(startDate),
    endDate: formatDateForGA(endDate),
  };

  // Debug log
  console.log("getAnalyticsDateRange:", {
    range,
    customStart: customStart?.toISOString().split("T")[0],
    customEnd: customEnd?.toISOString().split("T")[0],
    result,
  });

  return result;
}

/**
 * Validate date range for analytics
 */
export function validateAnalyticsDateRange(
  startDate: Date,
  endDate: Date
): string | null {
  if (startDate > endDate) {
    return "Start date must be before end date";
  }

  const yesterday = getYesterday();
  if (endDate > yesterday) {
    return "End date cannot be later than yesterday (GA data has 1-day delay)";
  }

  // Check if range is too long (max 1 year)
  const oneYearAgo = new Date(yesterday);
  oneYearAgo.setFullYear(yesterday.getFullYear() - 1);

  if (startDate < oneYearAgo) {
    return "Date range cannot exceed 1 year";
  }

  // Check if range is too short (min 1 day)
  const daysDiff = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysDiff < 0) {
    return "Date range must be at least 1 day";
  }

  return null;
}
