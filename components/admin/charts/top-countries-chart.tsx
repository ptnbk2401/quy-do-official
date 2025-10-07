"use client";

import { CountryData } from "../analytics-dashboard";

interface TopCountriesChartProps {
  data: CountryData[];
  loading?: boolean;
}

export function TopCountriesChart({
  data,
  loading = false,
}: TopCountriesChartProps) {
  // Get flag emoji for country code
  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode === "XX") return "🌍";

    // Convert country code to flag emoji
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));

    return String.fromCodePoint(...codePoints);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
        <div className="mb-6">
          <div className="h-6 bg-[#2E2E2E] rounded w-32 mb-2 animate-pulse"></div>
          <div className="h-4 bg-[#2E2E2E] rounded w-48 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-4 bg-[#2E2E2E] rounded animate-pulse"></div>
                <div className="flex-1 h-4 bg-[#2E2E2E] rounded animate-pulse"></div>
                <div className="w-16 h-4 bg-[#2E2E2E] rounded animate-pulse"></div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">
            Top Countries
          </h3>
          <p className="text-gray-400 text-sm">Sessions by country</p>
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
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-400">No country data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total sessions and percentages
  const totalSessions = data.reduce(
    (sum, country) => sum + country.sessions,
    0
  );
  const maxSessions = Math.max(...data.map((country) => country.sessions));

  return (
    <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Top Countries</h3>
        <p className="text-gray-400 text-sm">Sessions by country</p>
        <div className="text-sm text-gray-500 mt-2">
          Total: {totalSessions.toLocaleString()} sessions
        </div>
      </div>

      {/* Countries List */}
      <div className="space-y-4">
        {data.map((country, index) => {
          const percentage =
            totalSessions > 0 ? (country.sessions / totalSessions) * 100 : 0;
          const barWidth =
            maxSessions > 0 ? (country.sessions / maxSessions) * 100 : 0;

          return (
            <div key={country.countryCode} className="space-y-2">
              {/* Country Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-[#DA291C] text-white text-xs font-bold rounded">
                    {index + 1}
                  </div>
                  <div className="text-lg">
                    {getFlagEmoji(country.countryCode)}
                  </div>
                  <span className="text-gray-300 font-medium">
                    {country.country}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">
                    {country.sessions.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#2E2E2E] rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#DA291C] to-[#FBE122] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      {data.length > 0 && (
        <div className="mt-6 pt-4 border-t border-[#2E2E2E]">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-[#DA291C]">
                {data.length}
              </div>
              <div className="text-xs text-gray-400">Countries</div>
            </div>
            <div>
              <div className="text-lg font-bold text-[#FBE122]">
                {data[0]?.country || "N/A"}
              </div>
              <div className="text-xs text-gray-400">Top Country</div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Based on user location from Google Analytics
      </div>
    </div>
  );
}
