import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createGAClient, getGAPropertyId } from "@/lib/google-analytics";
import { getAnalyticsDateRange } from "@/lib/date-utils";

export async function GET() {
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

    const client = createGAClient();
    const propertyId = getGAPropertyId();

    // Get date range (last 7 days)
    const { startDate, endDate } = getAnalyticsDateRange("7d");

    console.log("Debug API - Testing with:", {
      propertyId,
      startDate,
      endDate,
    });

    // Test 1: Simple metrics only
    try {
      console.log("Test 1: Simple activeUsers metric");
      const [response1] = await client.runReport({
        property: propertyId,
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: "activeUsers" }],
      });

      console.log("Test 1 Success:", response1.rows?.length || 0, "rows");
    } catch (error) {
      console.error("Test 1 Failed:", error);
      return NextResponse.json({
        success: false,
        test: 1,
        error: error instanceof Error ? error.message : "Unknown error",
        details: { propertyId, startDate, endDate },
      });
    }

    // Test 2: Multiple basic metrics
    try {
      console.log("Test 2: Multiple basic metrics");
      const [response2] = await client.runReport({
        property: propertyId,
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      });

      console.log("Test 2 Success:", response2.rows?.length || 0, "rows");
    } catch (error) {
      console.error("Test 2 Failed:", error);
      return NextResponse.json({
        success: false,
        test: 2,
        error: error instanceof Error ? error.message : "Unknown error",
        details: { propertyId, startDate, endDate },
      });
    }

    // Test 3: With dimensions
    try {
      console.log("Test 3: With date dimension");
      const [response3] = await client.runReport({
        property: propertyId,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }],
        limit: 10,
      });

      console.log("Test 3 Success:", response3.rows?.length || 0, "rows");
    } catch (error) {
      console.error("Test 3 Failed:", error);
      return NextResponse.json({
        success: false,
        test: 3,
        error: error instanceof Error ? error.message : "Unknown error",
        details: { propertyId, startDate, endDate },
      });
    }

    // Test 4: Problem metrics
    try {
      console.log("Test 4: Testing problematic metrics");
      const [response4] = await client.runReport({
        property: propertyId,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: "screenPageViews" },
          { name: "newUsers" },
          { name: "bounceRate" },
        ],
      });

      console.log("Test 4 Success:", response4.rows?.length || 0, "rows");
    } catch (error) {
      console.error("Test 4 Failed:", error);
      return NextResponse.json({
        success: false,
        test: 4,
        error: error instanceof Error ? error.message : "Unknown error",
        details: { propertyId, startDate, endDate },
        note: "This test checks the metrics that might be causing INVALID_ARGUMENT",
      });
    }

    return NextResponse.json({
      success: true,
      message: "All tests passed!",
      details: { propertyId, startDate, endDate },
    });
  } catch (error) {
    console.error("Debug API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred during debug testing",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
