import { BetaAnalyticsDataClient } from "@google-analytics/data";

// Google Analytics configuration interface
export interface GAConfig {
  propertyId: string;
  serviceAccountEmail: string;
  privateKey: string;
  projectId: string;
  clientEmail: string;
}

// Analytics data interfaces
export interface OverviewMetrics {
  totalVisits: number;
  newUsers: number;
  sessions: number;
  bounceRate: number;
  previousPeriodComparison?: {
    totalVisits: number;
    newUsers: number;
    sessions: number;
    bounceRate: number;
  };
}

export interface TrafficData {
  date: string;
  visits: number;
  users: number;
}

export interface TrafficSource {
  source: string;
  visits: number;
  percentage: number;
}

export interface PopularPage {
  url: string;
  title: string;
  views: number;
  uniqueViews: number;
}

export interface DeviceData {
  device: "Desktop" | "Mobile" | "Tablet";
  sessions: number;
  percentage: number;
}

export interface CountryData {
  country: string;
  countryCode: string;
  sessions: number;
}

// Error types
export enum GAErrorCodes {
  AUTHENTICATION_FAILED = "AUTH_FAILED",
  INVALID_CREDENTIALS = "INVALID_CREDS",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT",
  INVALID_DATE_RANGE = "INVALID_DATE_RANGE",
  GA_API_ERROR = "GA_API_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  MISSING_CONFIG = "MISSING_CONFIG",
}

export class GAError extends Error {
  constructor(
    public code: GAErrorCodes,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "GAError";
  }
}

// Get GA configuration from environment variables
function getGAConfig(): GAConfig {
  const propertyId = process.env.GA_PROPERTY_ID;
  const serviceAccountEmail = process.env.GA_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GA_PRIVATE_KEY;
  const projectId = process.env.GA_PROJECT_ID;
  const clientEmail = process.env.GA_CLIENT_EMAIL;

  if (
    !propertyId ||
    !serviceAccountEmail ||
    !privateKey ||
    !projectId ||
    !clientEmail
  ) {
    throw new GAError(
      GAErrorCodes.MISSING_CONFIG,
      "Missing required Google Analytics configuration. Please check your environment variables."
    );
  }

  return {
    propertyId,
    serviceAccountEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
    projectId,
    clientEmail,
  };
}

// Create authenticated GA client
export function createGAClient(): BetaAnalyticsDataClient {
  try {
    const config = getGAConfig();

    // Create service account credentials object
    const credentials = {
      type: "service_account",
      project_id: config.projectId,
      private_key: config.privateKey,
      client_email: config.clientEmail,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
    };

    // Create GA client with credentials
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials,
      projectId: config.projectId,
    });

    return analyticsDataClient;
  } catch (error) {
    if (error instanceof GAError) {
      throw error;
    }
    throw new GAError(
      GAErrorCodes.AUTHENTICATION_FAILED,
      "Failed to create Google Analytics client",
      error
    );
  }
}

// Get GA property ID
export function getGAPropertyId(): string {
  const config = getGAConfig();
  return `properties/${config.propertyId}`;
}

// Utility function to format dates for GA API
export function formatDateForGA(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Utility function to get date range
export function getDateRange(
  range: "7d" | "30d" | "90d" | "custom",
  customStart?: Date,
  customEnd?: Date
) {
  const endDate = new Date();
  let startDate = new Date();

  switch (range) {
    case "7d":
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(endDate.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(endDate.getDate() - 90);
      break;
    case "custom":
      if (customStart && customEnd) {
        startDate = customStart;
        endDate.setTime(customEnd.getTime());
      } else {
        throw new GAError(
          GAErrorCodes.INVALID_DATE_RANGE,
          "Custom date range requires both start and end dates"
        );
      }
      break;
  }

  return {
    startDate: formatDateForGA(startDate),
    endDate: formatDateForGA(endDate),
  };
}

// Validate date range
export function validateDateRange(startDate: string, endDate: string): void {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new GAError(
      GAErrorCodes.INVALID_DATE_RANGE,
      "Invalid date format. Please use YYYY-MM-DD format."
    );
  }

  if (start > end) {
    throw new GAError(
      GAErrorCodes.INVALID_DATE_RANGE,
      "Start date must be before end date."
    );
  }

  if (end > now) {
    throw new GAError(
      GAErrorCodes.INVALID_DATE_RANGE,
      "End date cannot be in the future."
    );
  }

  // GA4 has a limit of 4 years of historical data
  const fourYearsAgo = new Date();
  fourYearsAgo.setFullYear(now.getFullYear() - 4);

  if (start < fourYearsAgo) {
    throw new GAError(
      GAErrorCodes.INVALID_DATE_RANGE,
      "Start date cannot be more than 4 years ago."
    );
  }
}

// Handle GA API errors
export function handleGAError(error: any): GAError {
  if (error instanceof GAError) {
    return error;
  }

  // Handle specific GA API errors
  if (error.code === "UNAUTHENTICATED") {
    return new GAError(
      GAErrorCodes.AUTHENTICATION_FAILED,
      "Authentication failed. Please check your service account credentials.",
      error
    );
  }

  if (error.code === "PERMISSION_DENIED") {
    return new GAError(
      GAErrorCodes.AUTHENTICATION_FAILED,
      "Permission denied. Please check your service account has access to the GA property.",
      error
    );
  }

  if (error.code === "QUOTA_EXCEEDED" || error.code === "RATE_LIMIT_EXCEEDED") {
    return new GAError(
      GAErrorCodes.RATE_LIMIT_EXCEEDED,
      "Rate limit exceeded. Please try again later.",
      error
    );
  }

  if (error.code === "INVALID_ARGUMENT") {
    return new GAError(
      GAErrorCodes.INVALID_DATE_RANGE,
      "Invalid request parameters.",
      error
    );
  }

  // Network errors
  if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
    return new GAError(
      GAErrorCodes.NETWORK_ERROR,
      "Network error. Please check your internet connection.",
      error
    );
  }

  // Generic GA API error
  return new GAError(
    GAErrorCodes.GA_API_ERROR,
    error.message || "An error occurred while fetching analytics data.",
    error
  );
}
