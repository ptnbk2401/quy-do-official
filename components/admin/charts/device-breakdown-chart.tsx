"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DeviceData } from "../analytics-dashboard";

interface DeviceBreakdownChartProps {
  data: DeviceData[];
  loading?: boolean;
}

export function DeviceBreakdownChart({
  data,
  loading = false,
}: DeviceBreakdownChartProps) {
  // Device icons
  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "Desktop":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
      case "Mobile":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"
            />
          </svg>
        );
      case "Tablet":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
    }
  };

  // Device colors
  const getDeviceColor = (device: string) => {
    switch (device) {
      case "Desktop":
        return "#DA291C";
      case "Mobile":
        return "#FBE122";
      case "Tablet":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div style={{ color: getDeviceColor(data.device) }}>
              {getDeviceIcon(data.device)}
            </div>
            <p className="text-white font-semibold">{data.device}</p>
          </div>
          <p className="text-sm text-gray-300">
            Sessions: {data.sessions.toLocaleString()}
          </p>
          <p className="text-sm text-gray-300">
            Percentage: {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
        <div className="mb-6">
          <div className="h-6 bg-[#2E2E2E] rounded w-32 mb-2 animate-pulse"></div>
          <div className="h-4 bg-[#2E2E2E] rounded w-48 animate-pulse"></div>
        </div>
        <div className="h-64 bg-[#2E2E2E] rounded animate-pulse"></div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">
            Device Breakdown
          </h3>
          <p className="text-gray-400 text-sm">Sessions by device type</p>
        </div>
        <div className="h-64 flex items-center justify-center">
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
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-400">No device data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total sessions
  const totalSessions = data.reduce((sum, item) => sum + item.sessions, 0);

  return (
    <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">
          Device Breakdown
        </h3>
        <p className="text-gray-400 text-sm">Sessions by device type</p>
        <div className="text-sm text-gray-500 mt-2">
          Total: {totalSessions.toLocaleString()} sessions
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
            <XAxis dataKey="device" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sessions" fill="#DA291C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Device Stats */}
      <div className="space-y-3">
        {data.map((device) => (
          <div
            key={device.device}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div style={{ color: getDeviceColor(device.device) }}>
                {getDeviceIcon(device.device)}
              </div>
              <span className="text-gray-300 font-medium">{device.device}</span>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">
                {device.sessions.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">
                {device.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Based on device category from Google Analytics
      </div>
    </div>
  );
}
