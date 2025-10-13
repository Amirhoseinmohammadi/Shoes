"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SingleShoe from "@/components/Products/SingleShoe";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError(err.message || "خطا در دریافت محصول");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        در حال بارگذاری محصول...
      </div>
    );

  if (error)
    return (
      <div className="flex h-64 items-center justify-center text-red-500">
        {error}
      </div>
    );

  if (!product)
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        محصولی یافت نشد.
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mt-10">
        <SingleShoe shoe={product} />
      </div>
    </div>
  );
}
