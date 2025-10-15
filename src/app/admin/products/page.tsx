"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTelegramAuth } from "@/hooks/useTelegramAuth";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoading: authLoading } = useTelegramAuth();

  const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID
    ? parseInt(process.env.NEXT_PUBLIC_ADMIN_USER_ID)
    : 697803275;

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/admin/products");
        if (!res.ok) throw new Error("خطا در دریافت محصولات");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user && user.id === ADMIN_USER_ID) {
      fetchProducts();
    }
  }, [user, ADMIN_USER_ID]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">در حال بررسی دسترسی...</div>
      </div>
    );
  }

  if (!user || user.id !== ADMIN_USER_ID) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-red-500">
          <h1 className="mb-4 text-2xl font-bold">دسترسی غیرمجاز</h1>
          <p>شما دسترسی لازم برای مشاهده این صفحه را ندارید.</p>
          <p className="mt-2 text-sm">
            User ID: {user?.id} | Required: {ADMIN_USER_ID}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
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
        <p className="text-gray-500">در حال بارگذاری محصولات...</p>
      </div>
    );
  }

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

      {products.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          هیچ محصولی یافت نشد
        </div>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-gray-500">{p.price} تومان</p>
              </div>
              <Link
                href={`/admin/products/${p.id}`}
                className="text-blue-600 hover:underline"
              >
                ویرایش
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
