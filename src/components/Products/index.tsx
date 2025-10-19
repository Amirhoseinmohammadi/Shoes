"use client";

import { useState } from "react";
import SingleShoe from "./SingleShoe";
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
      <section className="min-h-screen bg-gradient-to-b from-cyan-600 via-blue-600 to-indigo-700 py-10">
        <div className="container mx-auto px-4">
          <div className="mb-10 h-14 w-full animate-pulse rounded-2xl bg-white/10 backdrop-blur-sm"></div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl bg-white/10 p-4 shadow-md backdrop-blur-sm"
              >
                <div className="aspect-square w-full animate-pulse rounded-xl bg-white/20"></div>
                <div className="mt-4 h-4 w-3/4 animate-pulse rounded-md bg-white/20"></div>
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded-md bg-white/20"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-cyan-600 via-blue-600 to-indigo-700 p-6">
        <div className="max-w-md rounded-3xl bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
            <ExclamationTriangleIcon className="h-10 w-10 text-red-400" />
          </div>
          <h3 className="mb-3 text-2xl font-bold text-white">
            خطا در بارگذاری محصولات
          </h3>
          <p className="mb-8 text-gray-200">
            مشکلی در دریافت محصولات پیش آمد. لطفاً دوباره تلاش کنید.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-cyan-500/40"
          >
            <ArrowPathIcon className="h-5 w-5" />
            تلاش مجدد
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-cyan-600 via-blue-600 to-indigo-700 py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="relative mx-auto max-w-3xl">
            <MagnifyingGlassIcon className="absolute top-1/2 right-5 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              placeholder="جستجو بین محصولات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/20 bg-white/10 py-4 pr-12 pl-4 text-white placeholder-gray-300 shadow-inner backdrop-blur-md transition-all focus:border-cyan-400 focus:bg-white/20 focus:ring-2 focus:ring-cyan-300/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 left-4 -translate-y-1/2 rounded-lg p-1.5 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {filteredShoes.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
            <div className="rounded-3xl bg-white/10 p-10 shadow-xl backdrop-blur-md">
              <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-white/20">
                <FaceFrownIcon className="h-14 w-14 text-white/70" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-white">
                محصولی یافت نشد
              </h3>
              <p className="mb-6 text-gray-200">
                {searchQuery ? (
                  <>
                    هیچ محصولی با نام{" "}
                    <span className="font-semibold text-cyan-300">
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
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:scale-105"
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
