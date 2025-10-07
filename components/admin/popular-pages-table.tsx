"use client";

import { PopularPage } from "./analytics-dashboard";

interface PopularPagesTableProps {
  data: PopularPage[];
  loading?: boolean;
}

export function PopularPagesTable({
  data,
  loading = false,
}: PopularPagesTableProps) {
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
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-4 bg-[#2E2E2E] rounded animate-pulse"></div>
                <div className="flex-1 h-4 bg-[#2E2E2E] rounded animate-pulse"></div>
                <div className="w-16 h-4 bg-[#2E2E2E] rounded animate-pulse"></div>
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
            Popular Pages
          </h3>
          <p className="text-gray-400 text-sm">
            Most visited pages on your website
          </p>
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-400">No page data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total views
  const totalViews = data.reduce((sum, page) => sum + page.views, 0);

  return (
    <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Popular Pages</h3>
        <p className="text-gray-400 text-sm">
          Most visited pages on your website
        </p>
        <div className="text-sm text-gray-500 mt-2">
          Total: {totalViews.toLocaleString()} page views
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2E2E2E]">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-400 uppercase tracking-wider">
                #
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-400 uppercase tracking-wider">
                Page
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-400 uppercase tracking-wider">
                Views
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-400 uppercase tracking-wider">
                Unique
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-400 uppercase tracking-wider">
                %
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2E2E2E]">
            {data.map((page, index) => {
              const percentage =
                totalViews > 0 ? (page.views / totalViews) * 100 : 0;

              return (
                <tr
                  key={`${page.url}-${index}`}
                  className="hover:bg-[#2E2E2E]/30 transition-colors"
                >
                  {/* Rank */}
                  <td className="py-4 px-2">
                    <div className="flex items-center justify-center w-6 h-6 bg-[#DA291C] text-white text-xs font-bold rounded">
                      {index + 1}
                    </div>
                  </td>

                  {/* Page Info */}
                  <td className="py-4 px-2">
                    <div className="space-y-1">
                      <div className="text-white font-medium">{page.title}</div>
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#DA291C] hover:text-[#FBE122] text-sm transition-colors inline-flex items-center gap-1"
                      >
                        {page.url}
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  </td>

                  {/* Page Views */}
                  <td className="py-4 px-2 text-right">
                    <div className="text-white font-semibold">
                      {page.views.toLocaleString()}
                    </div>
                  </td>

                  {/* Unique Views */}
                  <td className="py-4 px-2 text-right">
                    <div className="text-gray-300">
                      {page.uniqueViews.toLocaleString()}
                    </div>
                  </td>

                  {/* Percentage */}
                  <td className="py-4 px-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="text-gray-300 text-sm">
                        {percentage.toFixed(1)}%
                      </div>
                      <div className="w-16 bg-[#2E2E2E] rounded-full h-2">
                        <div
                          className="bg-[#DA291C] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {data.length >= 10 && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Showing top {data.length} pages by page views
        </div>
      )}
    </div>
  );
}
