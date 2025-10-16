"use client";

import Link from "next/link";
import { useTelegram } from "@/hooks/useTelegram";
import { useApi } from "@/hooks/useApi";

export default function AdminProductsPage() {
  const { user, loading: authLoading, isAdmin } = useTelegram();
  const { data: products, error, isLoading } = useApi.useProducts();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">در حال بررسی دسترسی...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-red-500">
          <h1 className="mb-4 text-2xl font-bold">دسترسی غیرمجاز</h1>
          <p>شما دسترسی لازم برای مشاهده این صفحه را ندارید.</p>
          <p className="mt-2 text-sm">
            User ID: {user?.id} | Required:{" "}
            {process.env.NEXT_PUBLIC_ADMIN_USER_ID || 697803275}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-14 p-6">
        <div className="mb-4 flex justify-between">
          <h1 className="text-2xl font-bold">لیست محصولات</h1>
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-black px-3 py-2 text-white hover:bg-gray-800"
          >
            + افزودن محصول
          </Link>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="mt-2 h-3 w-20 rounded bg-gray-200"></div>
                </div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-14 p-6">
        <div className="mb-4 flex justify-between">
          <h1 className="text-2xl font-bold">لیست محصولات</h1>
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-black px-3 py-2 text-white hover:bg-gray-800"
          >
            + افزودن محصول
          </Link>
        </div>
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          خطا در بارگذاری محصولات: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-14 p-6">
      <div className="mb-6 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">لیست محصولات</h1>
          <p className="mt-1 text-sm text-gray-500">
            مدیریت محصولات فروشگاه - کاربر: {user?.first_name}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          + افزودن محصول جدید
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500">هیچ محصولی یافت نشد</p>
          <Link
            href="/admin/products/new"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            افزودن اولین محصول
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                  محصول
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                  قیمت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                  دسته‌بندی
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                  اقدامات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="ml-3 h-10 w-10 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.brand}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                    {product.price?.toLocaleString()} تومان
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      ویرایش
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
