import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createGAClient,
  getGAPropertyId,
  GAError,
  GAErrorCodes,
} from "@/lib/google-analytics";

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

    // Test GA configuration
    const config = {
      GA_PROPERTY_ID: process.env.GA_PROPERTY_ID ? "✓ Set" : "✗ Missing",
      GA_SERVICE_ACCOUNT_EMAIL: process.env.GA_SERVICE_ACCOUNT_EMAIL
        ? "✓ Set"
        : "✗ Missing",
      GA_PRIVATE_KEY: process.env.GA_PRIVATE_KEY ? "✓ Set" : "✗ Missing",
      GA_PROJECT_ID: process.env.GA_PROJECT_ID ? "✓ Set" : "✗ Missing",
      GA_CLIENT_EMAIL: process.env.GA_CLIENT_EMAIL ? "✓ Set" : "✗ Missing",
    };

    // Test GA client creation
    let clientTest = "Failed";
    let propertyTest = "Failed";
    let apiTest = "Failed";
    let errorDetails = null;

    try {
      const client = createGAClient();
      clientTest = "✓ Success";

      const propertyId = getGAPropertyId();
      propertyTest = `✓ Success (${propertyId})`;

      // Test a simple API call
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const [response] = await client.runReport({
        property: propertyId,
        dateRanges: [
          {
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
          },
        ],
        metrics: [{ name: "screenPageViews" }],
        limit: 1,
      });

      apiTest = "✓ Success";

      return NextResponse.json({
        success: true,
        data: {
          configuration: config,
          tests: {
            clientCreation: clientTest,
            propertyId: propertyTest,
            apiCall: apiTest,
          },
          sampleData: {
            rowCount: response.rows?.length || 0,
            hasData: (response.rows?.length || 0) > 0,
          },
        },
      });
    } catch (error) {
      errorDetails = {
        message: error instanceof Error ? error.message : "Unknown error",
        code: error instanceof GAError ? error.code : "UNKNOWN",
        stack: error instanceof Error ? error.stack : undefined,
      };

      return NextResponse.json({
        success: false,
        data: {
          configuration: config,
          tests: {
            clientCreation: clientTest,
            propertyId: propertyTest,
            apiCall: apiTest,
          },
          error: errorDetails,
        },
      });
    }
  } catch (error) {
    console.error("Analytics test API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred during testing",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
