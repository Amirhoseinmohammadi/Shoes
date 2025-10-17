"use client";

import Link from "next/link";
import { useTelegram } from "@/hooks/useTelegram";
import { useApi } from "@/hooks/useApi";
import { useState } from "react";

export default function AdminProductsPage() {
  const { user, loading: authLoading, isAdmin } = useTelegram();
  const { data: products, error, isLoading } = useApi.useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center">
          <div className="mb-4 text-6xl">🚫</div>
          <h1 className="mb-4 text-2xl font-bold text-gray-800">
            دسترسی غیرمجاز
          </h1>
          <p className="text-gray-600">
            شما دسترسی لازم برای مشاهده این صفحه را ندارید.
          </p>
        </div>
      </div>
    );
  }

  // فیلتر محصولات
  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // دسته‌بندی‌های منحصربه‌فرد
  const categories = [
    "all",
    ...new Set(products?.map((p) => p.category).filter(Boolean)),
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 pt-20">
        <div className="mx-auto max-w-6xl">
          {/* هدر */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                مدیریت محصولات
              </h1>
              <p className="mt-2 text-gray-600">در حال بارگذاری محصولات...</p>
            </div>
            <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200"></div>
          </div>

          {/* فیلترها */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="h-12 w-full animate-pulse rounded-xl bg-gray-200 md:w-64"></div>
            <div className="h-12 w-32 animate-pulse rounded-xl bg-gray-200"></div>
          </div>

          {/* لیست محصولات */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="rounded-2xl bg-white p-6 shadow-lg">
                  <div className="mb-4 h-40 rounded-xl bg-gray-200"></div>
                  <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="mb-3 h-3 w-1/2 rounded bg-gray-200"></div>
                  <div className="h-6 w-20 rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 pt-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
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
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
            <div className="mb-4 text-6xl">😔</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-800">
              خطا در بارگذاری
            </h3>
            <p className="mb-4 text-gray-600">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 pt-20">
      <div className="mx-auto max-w-7xl">
        {/* هدر */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">مدیریت محصولات</h1>
            <p className="mt-2 text-gray-600">
              کاربر: {user?.first_name} {user?.last_name}
              {user?.username && ` (@${user.username})`}
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
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
            <div className="text-2xl font-bold text-blue-600">
              {products?.length || 0}
            </div>
            <div className="text-sm text-gray-600">کل محصولات</div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
            <div className="text-2xl font-bold text-green-600">
              {products?.filter((p) => p.stock > 0).length || 0}
            </div>
            <div className="text-sm text-gray-600">موجود در انبار</div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
            <div className="text-2xl font-bold text-orange-600">
              {categories.length - 1}
            </div>
            <div className="text-sm text-gray-600">دسته‌بندی</div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
            <div className="text-2xl font-bold text-purple-600">
              {filteredProducts?.length || 0}
            </div>
            <div className="text-sm text-gray-600">نمایش داده شده</div>
          </div>
        </div>

        {/* فیلتر و جستجو */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="جستجو در محصولات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
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
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <div className="mb-4 text-6xl">📦</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-800">
              محصولی یافت نشد
            </h3>
            <p className="mb-6 text-gray-600">
              {searchTerm || selectedCategory !== "all"
                ? "هیچ محصولی با فیلترهای انتخاب شده مطابقت ندارد."
                : "هنوز هیچ محصولی اضافه نکرده‌اید."}
            </p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-white transition-all hover:shadow-lg"
            >
              <span>+</span>
              <span>افزودن اولین محصول</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                {/* تصویر محصول */}
                <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-gray-100">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      📸
                    </div>
                  )}
                </div>

                {/* اطلاعات محصول */}
                <div className="mb-4">
                  <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-800">
                    {product.name}
                  </h3>
                  <p className="mb-2 line-clamp-1 text-sm text-gray-600">
                    {product.brand}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">
                      {product.price?.toLocaleString()} تومان
                    </span>
                    {product.stock !== undefined && (
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          product.stock > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.stock > 0 ? `${product.stock} عدد` : "ناموجود"}
                      </span>
                    )}
                  </div>
                </div>

                {/* دسته‌بندی و اقدامات */}
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                    {product.category || "بدون دسته"}
                  </span>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition-all hover:bg-blue-100"
                  >
                    ویرایش
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
