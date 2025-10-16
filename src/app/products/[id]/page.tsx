"use client";

import { useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import SingleShoe from "@/components/Products/SingleShoe";
import { Product } from "@/types/api";

export default function ProductPage() {
  const { id } = useParams();
  const productId = id ? parseInt(id as string) : undefined;

  const { data: product, error, isLoading } = useApi.useProduct(productId!);

  if (isLoading)
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="mt-10">
          <div className="animate-pulse">
            <div className="h-96 rounded bg-gray-200"></div>
            <div className="mt-4 h-6 w-3/4 rounded bg-gray-200"></div>
            <div className="mt-2 h-4 w-1/2 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex h-64 items-center justify-center text-red-500">
        {error.message || "خطا در دریافت محصول"}
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
