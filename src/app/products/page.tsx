"use client";

import { useState } from "react";
import SingleShoe from "@/components/Products/SingleShoe";
import { useApi } from "@/hooks/useApi";
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredShoes =
    shoes?.filter((shoe) =>
      shoe.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  if (isLoading) {
    return (
      <section className="min-h-screen bg-gray-100 py-12 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mb-10 h-14 w-full animate-pulse rounded-3xl bg-white/20 dark:bg-gray-800/50"></div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-2xl bg-white/20 p-4 shadow-lg backdrop-blur-sm dark:bg-gray-800/50"
              >
                <div className="aspect-square w-full rounded-xl bg-white/30 dark:bg-gray-700/50"></div>
                <div className="mt-4 h-4 w-3/4 rounded-md bg-white/30 dark:bg-gray-700/50"></div>
                <div className="mt-2 h-3 w-1/2 rounded-md bg-white/30 dark:bg-gray-700/50"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gray-100 p-6 dark:bg-gray-900">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl backdrop-blur-xl dark:bg-gray-800/50">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
            <ExclamationTriangleIcon className="h-10 w-10 text-red-400 dark:text-red-300" />
          </div>
          <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
            خطا در بارگذاری محصولات
          </h3>
          <p className="mb-8 text-gray-700 dark:text-gray-300">
            مشکلی در دریافت محصولات پیش آمد. لطفاً دوباره تلاش کنید.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-300 px-6 py-3 font-semibold text-gray-800 shadow-lg transition-all hover:scale-105 hover:shadow-cyan-500/40 dark:bg-gray-700 dark:text-white"
          >
            <ArrowPathIcon className="h-5 w-5" />
            تلاش مجدد
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-100 py-12 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Search */}
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
                <SingleShoe shoe={shoe} telegramUser={telegramUser} />
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
