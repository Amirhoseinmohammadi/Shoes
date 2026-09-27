"use client";

import { useEffect } from "react";
import { ArrowPathIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Client Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
        مشکلی در بارگذاری صفحه رخ داد
      </h2>
      <p className="mb-6 max-w-md text-sm text-gray-600 dark:text-gray-400">
        لطفاً دوباره تلاش کنید یا برنامه را مجدداً بارگذاری کنید.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 font-medium text-white shadow-md transition hover:bg-cyan-700"
      >
        <ArrowPathIcon className="h-4 w-4" />
        تلاش مجدد
      </button>
    </div>
  );
}
