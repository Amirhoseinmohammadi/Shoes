import React from "react";

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
  type?: "card" | "line" | "circle" | "productGrid";
}

export default function LoadingSkeleton({
  className = "",
  count = 1,
  type = "line",
}: LoadingSkeletonProps) {
  if (type === "productGrid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(count || 8)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-2xl bg-white p-4 shadow-sm border border-gray-100 dark:border-gray-800 dark:bg-gray-800 animate-pulse"
          >
            <div className="aspect-square w-full rounded-xl bg-gray-200 dark:bg-gray-700 mb-4" />
            <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
            <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700 mb-4" />
            <div className="mt-auto flex items-center justify-between pt-2">
              <div className="h-6 w-20 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "card") {
    return (
      <div className="space-y-4">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800 animate-pulse ${className}`}
          >
            <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700 mb-4" />
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700 mb-2" />
            <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "circle") {
    return (
      <div className="flex items-center gap-3">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className={`h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
        />
      ))}
    </div>
  );
}
