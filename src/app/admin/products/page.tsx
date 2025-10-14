"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  if (loading) return <p className="p-6">در حال بارگذاری...</p>;

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
    </div>
  );
}
