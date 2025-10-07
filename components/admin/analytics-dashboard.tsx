"use client";

import { useState, useEffect, useCallback } from "react";
import { getAnalyticsDateRange } from "@/lib/date-utils";
import { TimeRangeFilter } from "./time-range-filter";
import { KPICards } from "./kpi-cards";
import { TrafficChart } from "./charts/traffic-chart";
import { TrafficSourcesChart } from "./charts/traffic-sources-chart";
import { PopularPagesTable } from "./popular-pages-table";
import { DeviceBreakdownChart } from "./charts/device-breakdown-chart";
import { TopCountriesChart } from "./charts/top-countries-chart";
import { AnalyticsDashboardSkeleton } from "./skeleton-loader";
import { AnalyticsSetupGuide } from "./analytics-setup-guide";

// Types
export interface AnalyticsData {
  overview: OverviewMetrics;
  traffic: TrafficData[];
  sources: TrafficSource[];
  topPages: PopularPage[];
  devices: DeviceData[];
  countries: CountryData[];
}

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

export type TimeRange = "7d" | "30d" | "90d" | "custom";

interface APIError {
  code: string;
  message: string;
  details?: any;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
}

export function AnalyticsDashboard() {
  // State management
  const [selectedRange, setSelectedRange] = useState<TimeRange>("7d");
  const [customDateRange, setCustomDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(null);

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Calculate date range based on selection
  const getDateRange = () => {
    const result = getAnalyticsDateRange(
      selectedRange,
      customDateRange?.startDate,
      customDateRange?.endDate
    );

    console.log("Analytics Dashboard - Date range calculation:", {
      selectedRange,
      customDateRange,
      result,
    });

    return result;
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateRange();

      // Additional validation to ensure dates are not in future
      const today = new Date();
      const endDateObj = new Date(endDate);

      if (endDateObj >= today) {
        console.error("Calculated end date is in future, forcing yesterday:", {
          endDate,
          today: today.toISOString().split("T")[0],
        });
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const correctedEndDate = yesterday.toISOString().split("T")[0];

        const correctedStartDate = new Date(yesterday);
        correctedStartDate.setDate(yesterday.getDate() - 6);
        const correctedStart = correctedStartDate.toISOString().split("T")[0];

        const params = new URLSearchParams({
          startDate: correctedStart,
          endDate: correctedEndDate,
        });

        console.log("Using corrected dates:", {
          startDate: correctedStart,
          endDate: correctedEndDate,
        });
      } else {
        const params = new URLSearchParams({ startDate, endDate });
      }

      const params = new URLSearchParams({ startDate, endDate });

      // Fetch all analytics data concurrently
      const [overviewRes, trafficRes, sourcesRes, topPagesRes, devicesRes] =
        await Promise.all([
          fetch(`/api/analytics/overview?${params}`),
          fetch(`/api/analytics/traffic?${params}`),
          fetch(`/api/analytics/sources?${params}`),
          fetch(`/api/analytics/top-pages?${params}`),
          fetch(`/api/analytics/devices?${params}`),
        ]);

      // Check if all requests were successful
      const responses = [
        overviewRes,
        trafficRes,
        sourcesRes,
        topPagesRes,
        devicesRes,
      ];
      const failedResponse = responses.find((res) => !res.ok);

      if (failedResponse) {
        const errorData = await failedResponse.json();
        throw new Error(
          errorData.error?.message || "Failed to fetch analytics data"
        );
      }

      // Parse all responses
      const [overview, traffic, sources, topPages, devices] = await Promise.all(
        [
          overviewRes.json() as Promise<APIResponse<OverviewMetrics>>,
          trafficRes.json() as Promise<APIResponse<TrafficData[]>>,
          sourcesRes.json() as Promise<APIResponse<TrafficSource[]>>,
          topPagesRes.json() as Promise<APIResponse<PopularPage[]>>,
          devicesRes.json() as Promise<
            APIResponse<{ devices: DeviceData[]; countries: CountryData[] }>
          >,
        ]
      );

      // Check for API errors
      const apiError = [overview, traffic, sources, topPages, devices].find(
        (res) => !res.success
      );
      if (apiError) {
        throw new Error(apiError.error?.message || "API returned an error");
      }

      // Set analytics data
      setAnalyticsData({
        overview: overview.data!,
        traffic: traffic.data!,
        sources: sources.data!,
        topPages: topPages.data!,
        devices: devices.data!.devices,
        countries: devices.data!.countries,
      });

      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error("Failed to fetch analytics data:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle time range change
  const handleRangeChange = (range: TimeRange) => {
    setSelectedRange(range);
    if (range !== "custom") {
      setCustomDateRange(null);
    }
  };

  // Handle custom date change
  const handleCustomDateChange = (startDate: Date, endDate: Date) => {
    setCustomDateRange({ startDate, endDate });
    setSelectedRange("custom");
  };

  // Handle retry with exponential backoff
  const handleRetry = () => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);

    // Exponential backoff: 1s, 2s, 4s, 8s, max 10s
    const delay = Math.min(1000 * Math.pow(2, newRetryCount - 1), 10000);

    setTimeout(() => {
      fetchAnalyticsData();
    }, delay);
  };

  // Debounced fetch function
  const debouncedFetch = useCallback(() => {
    const timeoutId = setTimeout(() => {
      fetchAnalyticsData();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [selectedRange, customDateRange]);

  // Fetch data on mount and when date range changes
  useEffect(() => {
    if (selectedRange === "custom" && customDateRange) {
      // Debounce custom date changes
      const cleanup = debouncedFetch();
      return cleanup;
    } else {
      // Immediate fetch for preset ranges
      fetchAnalyticsData();
    }
  }, [selectedRange, customDateRange, debouncedFetch]);

  // Loading state
  if (loading && !analyticsData) {
    return <AnalyticsDashboardSkeleton />;
  }

  // Error boundary component
  if (error) {
    // Check if it's a setup/permission error
    const isSetupError =
      error.includes("PERMISSION_DENIED") ||
      error.includes("MISSING_CONFIG") ||
      error.includes("AUTHENTICATION_FAILED") ||
      error.includes("INVALID_ARGUMENT");

    if (isSetupError) {
      return <AnalyticsSetupGuide />;
    }

    return (
      <div className="space-y-6">
        {/* Time Range Filter - always show */}
        <TimeRangeFilter
          selectedRange={selectedRange}
          onRangeChange={handleRangeChange}
          customDateRange={customDateRange}
          onCustomDateChange={handleCustomDateChange}
        />

        {/* Error State */}
        <div className="bg-[#1C1C1C] p-8 rounded-lg border border-red-500/20">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-red-400 mb-2">
              Failed to Load Analytics Data
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-[#DA291C] hover:bg-[#FBE122] hover:text-black text-white rounded-lg transition-colors font-semibold"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-[#2E2E2E] hover:bg-[#3E3E3E] text-white rounded-lg transition-colors"
              >
                Refresh Page
              </button>
            </div>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mt-4">
                Retry attempt: {retryCount}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <TimeRangeFilter
        selectedRange={selectedRange}
        onRangeChange={handleRangeChange}
        customDateRange={customDateRange}
        onCustomDateChange={handleCustomDateChange}
      />

      {/* KPI Cards */}
      <KPICards metrics={analyticsData?.overview} loading={loading} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <div className="lg:col-span-2">
          <TrafficChart data={analyticsData?.traffic || []} loading={loading} />
        </div>

        {/* Traffic Sources Chart */}
        <TrafficSourcesChart
          data={analyticsData?.sources || []}
          loading={loading}
        />

        {/* Device Breakdown Chart */}
        <DeviceBreakdownChart
          data={analyticsData?.devices || []}
          loading={loading}
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Pages Table */}
        <div className="lg:col-span-2">
          <PopularPagesTable
            data={analyticsData?.topPages || []}
            loading={loading}
          />
        </div>

        {/* Top Countries Chart */}
        <TopCountriesChart
          data={analyticsData?.countries || []}
          loading={loading}
        />
      </div>
    </div>
  );
}
