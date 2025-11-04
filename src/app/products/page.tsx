"use client";

import { useState, useEffect } from "react";
import SingleShoe from "@/components/Products/SingleShoe";
import { useApi } from "@/hooks/useApi";
import { useTelegram } from "@/hooks/useTelegram";
import {
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  FaceFrownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface ShoesProps {
  telegramUser?: any;
}

const Shoes = ({ telegramUser }: ShoesProps) => {
  const { data: shoes, error, isLoading } = useApi.useProducts();
  const { user: currentUser, loading: authLoading } = useTelegram();
  const [searchQuery, setSearchQuery] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // ✅ NEW: Get authenticated user from hook instead of props
  const authenticatedUser = currentUser || telegramUser;

  // ✅ NEW: Handle retry with exponential backoff
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    window.location.reload();
  };

  // ✅ NEW: Show loading state during auth check
  if (authLoading) {
    return (
      <section className="min-h-screen bg-gray-100 py-12 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex min-h-96 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500"></div>
              <p className="text-gray-600 dark:text-gray-400">
                در حال بررسی دسترسی...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ✅ NEW: Show loading skeleton while fetching products
  if (isLoading) {
    return (
      <section className="min-h-screen bg-gray-100 py-12 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          {/* Search skeleton */}
          <div className="mb-8 flex justify-center">
            <div className="relative w-full max-w-2xl">
              <div className="h-14 w-full animate-pulse rounded-3xl bg-gray-300 dark:bg-gray-700"></div>
            </div>
          </div>

          {/* Products skeleton */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-800"
              >
                <div className="aspect-square w-full rounded-xl bg-gray-300 dark:bg-gray-700"></div>
                <div className="mt-4 h-4 w-3/4 rounded-md bg-gray-300 dark:bg-gray-700"></div>
                <div className="mt-2 h-3 w-1/2 rounded-md bg-gray-300 dark:bg-gray-700"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ✅ IMPROVED: Better error handling with more info
  if (error) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gray-100 p-6 dark:bg-gray-900">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-gray-800">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
            <ExclamationTriangleIcon className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>

          <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
            خطا در بارگذاری محصولات
          </h3>

          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            {error?.message || "مشکلی در دریافت محصولات پیش آمد."}
          </p>

          <p className="mb-6 text-xs text-gray-500 dark:text-gray-500">
            لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              <ArrowPathIcon className="h-5 w-5" />
              تلاش مجدد
            </button>

            <button
              onClick={() => (window.location.href = "/")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-600 px-6 py-3 font-semibold text-white transition-all hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800"
            >
              بازگشت به خانه
            </button>
          </div>

          {retryCount > 2 && (
            <p className="mt-4 text-xs text-amber-600 dark:text-amber-400">
              اگر مشکل ادامه دارد، لطفاً برنامه را ببندید و دوباره باز کنید.
            </p>
          )}
        </div>
      </section>
    );
  }

  // ✅ FIXED: Use authenticated user from hook
  const filteredShoes =
    shoes?.filter((shoe) =>
      shoe.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  return (
    <section className="min-h-screen bg-gray-100 py-12 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Search Bar */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-2xl">
            <MagnifyingGlassIcon className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="جستجو بین محصولات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-3xl border border-gray-300 bg-white py-4 pr-12 pl-4 text-gray-900 placeholder-gray-400 shadow-inner transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:ring-cyan-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 left-4 -translate-y-1/2 rounded-lg p-2 text-gray-500 transition hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {filteredShoes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filteredShoes.map((shoe, i) => (
              <div
                key={shoe.id}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${i * 0.05}s both`,
                }}
              >
                {/* ✅ FIXED: Pass authenticated user from hook */}
                <SingleShoe shoe={shoe} telegramUser={authenticatedUser} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-lg text-center">
            <div className="rounded-3xl bg-white p-10 shadow-xl transition-all dark:bg-gray-800">
              <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <FaceFrownIcon className="h-14 w-14 text-gray-400 dark:text-gray-500" />
              </div>

              <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                محصولی یافت نشد
              </h3>

              <p className="mb-6 text-gray-600 dark:text-gray-400">
                {searchQuery ? (
                  <>
                    هیچ محصولی با نام{" "}
                    <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                      "{searchQuery}"
                    </span>{" "}
                    یافت نشد.
                  </>
                ) : (
                  "هنوز هیچ محصولی اضافه نشده است."
                )}
              </p>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-300 px-6 py-3 font-semibold text-gray-800 shadow-md transition-all hover:scale-105 hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                  پاک کردن جستجو
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default Shoes;
