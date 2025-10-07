"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrafficData } from "../analytics-dashboard";

interface TrafficChartProps {
  data: TrafficData[];
  loading?: boolean;
}

export function TrafficChart({ data, loading = false }: TrafficChartProps) {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return (
        <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-lg p-4 shadow-lg">
          <p className="text-white font-semibold mb-2">{formattedDate}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-6 bg-[#2E2E2E] rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-4 bg-[#2E2E2E] rounded w-48 animate-pulse"></div>
          </div>
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
            Traffic Overview
          </h3>
          <p className="text-gray-400 text-sm">
            Daily visits and users over time
          </p>
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
            <p className="text-gray-400">No traffic data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals for summary
  const totalVisits = data.reduce((sum, item) => sum + item.visits, 0);
  const totalUsers = data.reduce((sum, item) => sum + item.users, 0);
  const avgVisitsPerDay = Math.round(totalVisits / data.length);

  return (
    <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Traffic Overview
          </h3>
          <p className="text-gray-400 text-sm">
            Daily visits and users over time
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">
            Avg. {avgVisitsPerDay.toLocaleString()} visits/day
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#2E2E2E] p-4 rounded-lg">
          <div className="text-2xl font-bold text-[#DA291C]">
            {totalVisits.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Total Visits</div>
        </div>
        <div className="bg-[#2E2E2E] p-4 rounded-lg">
          <div className="text-2xl font-bold text-[#FBE122]">
            {totalUsers.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Total Users</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="visits"
              stroke="#DA291C"
              strokeWidth={3}
              name="Visits"
              dot={{ fill: "#DA291C", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#DA291C", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#FBE122"
              strokeWidth={3}
              name="Users"
              dot={{ fill: "#FBE122", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#FBE122", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Data shows daily traffic patterns. Hover over points for detailed
        information.
      </div>
    </div>
  );
}
