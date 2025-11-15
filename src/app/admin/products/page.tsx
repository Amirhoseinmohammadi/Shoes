"use client";

import Link from "next/link";
import Image from "next/image";
import { useTelegram } from "@/hooks/useTelegram";
import useSWR from "swr";
import { apiClient } from "@/lib/api-client";
import { useState } from "react";

interface Product {
  id: string | number;
  name: string;
  brand?: string;
  category?: string;
  price?: number;
  stock?: number;
  image?: string;
}

const defaultConfig = {
  revalidateOnFocus: false,
  dedupingInterval: 60000,
};

export default function AdminProductsPage() {
  const { user, loading: authLoading, isAdmin } = useTelegram();

  // ✅ استفاده از API path درست (Admin endpoint)
  const {
    data: products,
    error,
    isLoading,
    mutate,
  } = useSWR(
    "/api/admin/products",
    () =>
      apiClient.request("/api/admin/products", {
        method: "GET",
        credentials: "include",
      }),
    defaultConfig,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400">
            در حال بررسی دسترسی...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="mb-4 text-6xl">🚫</div>
          <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">
            دسترسی غیرمجاز
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            شما دسترسی لازم برای مشاهده این صفحه را ندارید.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            بازگشت به خانه
          </Link>
        </div>
      </div>
    );
  }

  const filteredProducts = products?.filter((product: Product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "all",
    ...new Set(products?.map((p: Product) => p.category).filter(Boolean)),
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 pt-20 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                مدیریت محصولات
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                در حال بارگذاری محصولات...
              </p>
            </div>
            <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
              >
                <div className="mb-2 h-6 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-8 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            ))}
          </div>

          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="h-12 flex-1 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-12 w-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"></div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
              >
                <div className="mb-4 aspect-square rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="mb-3 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex justify-between">
                  <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-6 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // حالت خطا
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 pt-20 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                مدیریت محصولات
              </h1>
            </div>
            <Link
              href="/admin/products/new"
              className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              + افزودن محصول
            </Link>
          </div>
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-gray-800">
            <div className="mb-4 text-6xl">😔</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
              خطا در بارگذاری محصولات
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {error?.message ||
                "مشکلی در دریافت اطلاعات محصولات پیش آمده است."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => mutate()}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                تلاش مجدد
              </button>
              <Link
                href="/admin"
                className="rounded-lg bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800"
              >
                بازگشت به پنل
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 pt-20 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl">
        {/* هدر */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              مدیریت محصولات
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {user ? (
                <>
                  کاربر: {user.first_name} {user.last_name}
                  {user.username && ` (@${user.username})`}
                </>
              ) : (
                "سیستم مدیریت محصولات"
              )}
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <span>+</span>
            <span>افزودن محصول جدید</span>
          </Link>
        </div>

        {/* آمار سریع */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {products?.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              کل محصولات
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {products?.filter((p: Product) => p.stock && p.stock > 0)
                .length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              موجود در انبار
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.max(0, categories.length - 1)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              دسته‌بندی
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {filteredProducts?.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              نمایش داده شده
            </div>
          </div>
        </div>

        {/* فیلتر و جستجو */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="جستجو در محصولات (نام یا برند)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 shadow-sm transition-colors placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:ring-blue-800"
            />
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              🔍
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute top-1/2 left-10 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            )}
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-800"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "همه دسته‌بندی‌ها" : category}
              </option>
            ))}
          </select>
        </div>

        {/* لیست محصولات */}
        {!filteredProducts || filteredProducts.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg dark:bg-gray-800">
            <div className="mb-4 text-6xl">📦</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
              محصولی یافت نشد
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {searchTerm || selectedCategory !== "all"
                ? "هیچ محصولی با فیلترهای انتخاب شده مطابقت ندارد."
                : "هنوز هیچ محصولی اضافه نکرده‌اید."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-white transition-all hover:shadow-lg"
              >
                <span>+</span>
                <span>افزودن اولین محصول</span>
              </Link>
              {(searchTerm || selectedCategory !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="rounded-xl bg-gray-600 px-6 py-3 text-white transition-all hover:shadow-lg dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  حذف فیلترها
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* اطلاعات فیلتر */}
            {(searchTerm || selectedCategory !== "all") && (
              <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>فیلترها:</span>
                {searchTerm && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {`جستجو: "${searchTerm}"`}
                  </span>
                )}
                {selectedCategory !== "all" && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {`دسته: "${selectedCategory}"`}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  حذف همه
                </button>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product: Product) => (
                <div
                  key={product.id}
                  className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-gray-700/50"
                >
                  {/* تصویر محصول */}
                  <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={300}
                        height={300}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        loading="lazy"
                        quality={75}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-500">
                        📸
                      </div>
                    )}
                  </div>

                  {/* اطلاعات محصول */}
                  <div className="mb-4">
                    <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-800 dark:text-white">
                      {product.name}
                    </h3>
                    {product.brand && (
                      <p className="mb-2 line-clamp-1 text-sm text-gray-600 dark:text-gray-400">
                        {product.brand}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {product.price
                          ? `${product.price.toLocaleString()} تومان`
                          : "قیمت نامشخص"}
                      </span>
                      {product.stock !== undefined && (
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            product.stock > 0
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {product.stock > 0
                            ? `${product.stock} عدد`
                            : "ناموجود"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* دسته‌بندی و اقدامات */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      {product.category || "بدون دسته"}
                    </span>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition-all hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                    >
                      ویرایش
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
