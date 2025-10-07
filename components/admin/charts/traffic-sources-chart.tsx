"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { TrafficSource } from "../analytics-dashboard";

interface TrafficSourcesChartProps {
  data: TrafficSource[];
  loading?: boolean;
}

export function TrafficSourcesChart({
  data,
  loading = false,
}: TrafficSourcesChartProps) {
  // Color palette for different sources
  const COLORS = {
    Search: "#DA291C",
    Social: "#FBE122",
    Direct: "#4F46E5",
    Referral: "#10B981",
    "Paid Search": "#F59E0B",
    "Paid Social": "#EF4444",
    Email: "#8B5CF6",
    Display: "#06B6D4",
    Other: "#6B7280",
  };

  // Get color for source
  const getColor = (source: string, index: number) => {
    return (
      COLORS[source as keyof typeof COLORS] || `hsl(${index * 45}, 70%, 50%)`
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-lg p-4 shadow-lg">
          <p className="text-white font-semibold mb-1">{data.source}</p>
          <p className="text-sm text-gray-300">
            Visits: {data.visits.toLocaleString()}
          </p>
          <p className="text-sm text-gray-300">
            Percentage: {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label function
  const renderLabel = (entry: any) => {
    if (entry.percentage < 5) return ""; // Hide labels for small slices
    return `${entry.percentage.toFixed(1)}%`;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
        <div className="mb-6">
          <div className="h-6 bg-[#2E2E2E] rounded w-32 mb-2 animate-pulse"></div>
          <div className="h-4 bg-[#2E2E2E] rounded w-48 animate-pulse"></div>
        </div>
        <div className="h-80 bg-[#2E2E2E] rounded animate-pulse"></div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">
            Traffic Sources
          </h3>
          <p className="text-gray-400 text-sm">Where your visitors come from</p>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-gray-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-gray-400">No traffic source data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total visits
  const totalVisits = data.reduce((sum, item) => sum + item.visits, 0);

  return (
    <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">
          Traffic Sources
        </h3>
        <p className="text-gray-400 text-sm">Where your visitors come from</p>
        <div className="text-sm text-gray-500 mt-2">
          Total: {totalVisits.toLocaleString()} visits
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data as any}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="visits"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColor(entry.source, index)}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {data.map((entry, index) => (
          <div
            key={entry.source}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getColor(entry.source, index) }}
              ></div>
              <span className="text-gray-300">{entry.source}</span>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">
                {entry.visits.toLocaleString()}
              </div>
              <div className="text-gray-400 text-xs">
                {entry.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Based on session default channel grouping from Google Analytics
      </div>
    </div>
  );
}
