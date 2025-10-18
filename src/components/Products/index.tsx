"use client";

import { useState } from "react";
import SingleShoe from "./SingleShoe";
import { useApi } from "@/hooks/useApi";

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
      <section className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Search Bar Skeleton */}
          <div className="mb-8 h-12 w-full animate-pulse rounded-2xl bg-gray-300"></div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="mb-3 aspect-square rounded-2xl bg-gray-300"></div>
                <div className="mb-2 h-4 rounded bg-gray-300"></div>
                <div className="mb-3 h-4 w-3/4 rounded bg-gray-300"></div>
                <div className="flex gap-2">
                  <div className="h-10 flex-1 rounded-xl bg-gray-300"></div>
                  <div className="h-10 w-10 rounded-xl bg-gray-300"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-2">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            خطا در بارگذاری محصولات
          </h3>
          <p className="mb-6 text-gray-500">لطفاً بعداً دوباره تلاش کنید</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-2.5 font-semibold text-white transition-all hover:bg-cyan-600 hover:shadow-lg"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            تلاش مجدد
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            کفش‌های جدید
          </h1>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="جستجو کفش مورد نظرتان..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 placeholder-gray-400 transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 focus:outline-none"
            />
            <svg
              className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Products Grid or Empty State */}
        {filteredShoes.length > 0 ? (
          <>
            {/* Results Counter */}
            <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">
                {filteredShoes.length}
              </span>
              <span>محصول پیدا شد</span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredShoes.map((shoe) => (
                <SingleShoe
                  key={shoe.id}
                  shoe={shoe}
                  telegramUser={telegramUser}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white py-16 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              محصولی یافت نشد
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? "با این نام محصولی پیدا نشد. لطفاً جستجو را دوباره امتحان کنید"
                : "هنوز هیچ محصولی اضافه نشده است"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-2 font-semibold text-white transition-all hover:bg-cyan-600"
              >
                پاک کردن جستجو
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Shoes;
