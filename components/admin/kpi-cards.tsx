"use client";

import { OverviewMetrics } from "./analytics-dashboard";

interface KPICardsProps {
  metrics?: OverviewMetrics;
  loading?: boolean;
}

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  loading?: boolean;
  formatter?: (value: number) => string;
}

function KPICard({
  title,
  value,
  icon,
  change,
  changeType = "neutral",
  loading = false,
  formatter,
}: KPICardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === "string") return val;
    if (formatter) return formatter(val);
    return val.toLocaleString();
  };

  const getChangeColor = () => {
    switch (changeType) {
      case "increase":
        return "text-green-400";
      case "decrease":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getChangeIcon = () => {
    if (changeType === "increase") {
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 17l9.2-9.2M17 17V7H7"
          />
        </svg>
      );
    }
    if (changeType === "decrease") {
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 7l-9.2 9.2M7 7v10h10"
          />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E] hover:border-[#DA291C]/30 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[#DA291C]">{icon}</div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm ${getChangeColor()}`}
          >
            {getChangeIcon()}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-white">
          {loading ? (
            <div className="h-8 bg-[#2E2E2E] rounded animate-pulse"></div>
          ) : (
            formatValue(value)
          )}
        </h3>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
      </div>

      {change !== undefined && !loading && (
        <div className="mt-3 text-xs text-gray-500">vs previous period</div>
      )}
    </div>
  );
}

export function KPICards({ metrics, loading = false }: KPICardsProps) {
  // Calculate percentage changes
  const calculateChange = (
    current: number,
    previous?: number
  ): { change: number; type: "increase" | "decrease" | "neutral" } => {
    if (!previous || previous === 0) {
      return { change: 0, type: "neutral" };
    }

    const changePercent = ((current - previous) / previous) * 100;
    return {
      change: Math.round(changePercent * 100) / 100,
      type:
        changePercent > 0
          ? "increase"
          : changePercent < 0
          ? "decrease"
          : "neutral",
    };
  };

  const visitsChange = metrics?.previousPeriodComparison
    ? calculateChange(
        metrics.totalVisits,
        metrics.previousPeriodComparison.totalVisits
      )
    : undefined;

  const usersChange = metrics?.previousPeriodComparison
    ? calculateChange(
        metrics.newUsers,
        metrics.previousPeriodComparison.newUsers
      )
    : undefined;

  const sessionsChange = metrics?.previousPeriodComparison
    ? calculateChange(
        metrics.sessions,
        metrics.previousPeriodComparison.sessions
      )
    : undefined;

  const bounceRateChange = metrics?.previousPeriodComparison
    ? calculateChange(
        metrics.bounceRate,
        metrics.previousPeriodComparison.bounceRate
      )
    : undefined;

  // Format bounce rate as percentage
  const formatBounceRate = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Visits */}
      <KPICard
        title="Total Visits"
        value={metrics?.totalVisits || 0}
        icon={
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        }
        change={visitsChange?.change}
        changeType={visitsChange?.type}
        loading={loading}
      />

      {/* New Users */}
      <KPICard
        title="New Users"
        value={metrics?.newUsers || 0}
        icon={
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        }
        change={usersChange?.change}
        changeType={usersChange?.type}
        loading={loading}
      />

      {/* Sessions */}
      <KPICard
        title="Sessions"
        value={metrics?.sessions || 0}
        icon={
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        change={sessionsChange?.change}
        changeType={sessionsChange?.type}
        loading={loading}
      />

      {/* Bounce Rate */}
      <KPICard
        title="Bounce Rate"
        value={metrics?.bounceRate || 0}
        icon={
          <svg
            className="w-8 h-8"
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
        }
        change={bounceRateChange?.change}
        changeType={
          bounceRateChange?.type === "increase"
            ? "decrease"
            : bounceRateChange?.type === "decrease"
            ? "increase"
            : "neutral"
        } // Invert for bounce rate (lower is better)
        loading={loading}
        formatter={formatBounceRate}
      />
    </div>
  );
}
