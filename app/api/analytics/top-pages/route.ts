import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchTopPages } from "@/lib/analytics-data";
import { GAError, GAErrorCodes } from "@/lib/google-analytics";

export const revalidate = 300; // Cache for 5 minutes

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    // Check admin permissions
    if (session.user?.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Admin access required" },
        },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : 10;

    // Validate required parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: GAErrorCodes.INVALID_DATE_RANGE,
            message: "Both startDate and endDate are required",
          },
        },
        { status: 400 }
      );
    }

    // Debug log the received dates
    console.log("Top Pages API - Received dates:", { startDate, endDate });

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: GAErrorCodes.INVALID_DATE_RANGE,
            message: "Invalid date format. Please use YYYY-MM-DD format.",
          },
        },
        { status: 400 }
      );
    }

    // Check if dates are in the future
    const today = new Date();
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (endDateObj >= today) {
      console.log("Date validation failed - end date in future:", {
        endDate,
        today: today.toISOString().split("T")[0],
        endDateObj: endDateObj.toISOString().split("T")[0],
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: GAErrorCodes.INVALID_DATE_RANGE,
            message:
              "End date cannot be today or in the future. GA data has 1-day delay.",
          },
        },
        { status: 400 }
      );
    }

    // Validate limit parameter
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: GAErrorCodes.INVALID_DATE_RANGE,
            message: "Invalid limit. Must be a number between 1 and 50.",
          },
        },
        { status: 400 }
      );
    }

    // Fetch top pages data from Google Analytics
    const topPagesData = await fetchTopPages(startDate, endDate, limit);

    return NextResponse.json({
      success: true,
      data: topPagesData,
    });
  } catch (error) {
    console.error("Analytics top pages API error:", error);

    if (error instanceof GAError) {
      const statusCode = getStatusCodeForGAError(error.code);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        },
        { status: statusCode }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred while fetching top pages data",
        },
      },
      { status: 500 }
    );
  }
}

// Helper function to map GA error codes to HTTP status codes
function getStatusCodeForGAError(errorCode: GAErrorCodes): number {
  switch (errorCode) {
    case GAErrorCodes.AUTHENTICATION_FAILED:
    case GAErrorCodes.INVALID_CREDENTIALS:
      return 401;
    case GAErrorCodes.RATE_LIMIT_EXCEEDED:
      return 429;
    case GAErrorCodes.INVALID_DATE_RANGE:
      return 400;
    case GAErrorCodes.MISSING_CONFIG:
      return 503;
    case GAErrorCodes.NETWORK_ERROR:
      return 502;
    case GAErrorCodes.GA_API_ERROR:
    default:
      return 500;
  }
}
