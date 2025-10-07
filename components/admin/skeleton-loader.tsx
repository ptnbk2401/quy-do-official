"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`bg-[#2E2E2E] rounded animate-pulse ${className}`}></div>
  );
}

export function KPICardSkeleton() {
  return (
    <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-8 h-8" />
        <Skeleton className="w-12 h-4" />
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

export function ChartSkeleton({ height = "h-80" }: { height?: string }) {
  return (
    <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
      <div className="mb-6">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className={`${height} w-full`} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
      <div className="mb-6">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-4">
        {Array(rows)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="w-8 h-4" />
              <Skeleton className="flex-1 h-4" />
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-16 h-4" />
            </div>
          ))}
      </div>
    </div>
  );
}

export function AnalyticsDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Time Range Filter Skeleton */}
      <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <KPICardSkeleton key={i} />
          ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <ChartSkeleton height="h-64" />
        <ChartSkeleton height="h-64" />
      </div>

      {/* Bottom Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TableSkeleton />
        </div>
        <ChartSkeleton height="h-64" />
      </div>
    </div>
  );
}
