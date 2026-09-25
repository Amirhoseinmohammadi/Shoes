import React from "react";

export default function HomeLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="fixed top-4 right-4 z-50 h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
      <div className="h-96 md:h-[500px] w-full animate-pulse bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950" />
      <div className="container mx-auto px-4 py-12">
        <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-gray-800 mb-8 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800/60 p-4 border border-gray-100 dark:border-gray-800"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
