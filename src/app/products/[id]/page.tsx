"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";
import Link from "next/link";

export default function ProductPage() {
  const { id } = useParams();
  const productId = id ? parseInt(id as string, 10) : undefined;

  const { data: product, error, isLoading } = useApi.useProduct(productId!);
  const { addItem, loading: cartLoading } = useCart();
  const { showToast } = useToast();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-4 pb-32 dark:bg-gray-900">
        <div className="mx-auto max-w-2xl px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-80 rounded-2xl bg-gray-300 dark:bg-gray-700" />
            <div className="h-8 w-1/2 rounded bg-gray-300 dark:bg-gray-700" />
            <div className="h-6 w-1/3 rounded bg-gray-300 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 pb-32 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">خطا در دریافت محصول</p>
      </div>
    );
  }

  const variants = product.variants ?? [];
  const currentVariant = variants[selectedColorIndex] ?? null;

  const images = useMemo(
    () =>
      currentVariant?.images?.map((i: any) => i.url) ||
      product.images?.map((i: any) => i.url) ||
      [],
    [currentVariant, product],
  );

  const displayImage = images[currentImageIndex] || "/images/default-shoe.png";

  const displayPrice = currentVariant?.price ?? product.price ?? 0;

  const handleAddToCart = async () => {
    if (!selectedSize) {
      showToast({
        type: "error",
        message: "لطفاً سایز را انتخاب کنید",
      });
      return;
    }

    await addItem({
      productId: product.id,
      quantity,
      color: currentVariant?.color || product.color || undefined,
      // sizeId: number  ← وقتی سایز واقعی از DB داشتی
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* Back */}
        <div className="mb-6 flex items-center justify-end">
          <Link
            href="/"
            className="rounded-lg p-2 transition hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            بازگشت
          </Link>
        </div>

        {/* Image */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow dark:bg-gray-800">
          <div className="relative aspect-square overflow-hidden rounded-xl">
            <Image
              src={displayImage}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative h-12 w-12 rounded-lg border-2 ${
                    currentImageIndex === idx
                      ? "border-cyan-500"
                      : "border-gray-300"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-800">
            <h1 className="mb-2 text-2xl font-bold">{product.name}</h1>
            <p className="text-xl font-bold">
              {displayPrice.toLocaleString()} تومان
            </p>
          </div>

          {/* Colors */}
          {variants.length > 0 && (
            <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-800">
              <h3 className="mb-3 font-bold">رنگ</h3>
              <div className="flex gap-3">
                {variants.map((v: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColorIndex(idx)}
                    className={`h-10 w-10 rounded-full border-4 ${
                      selectedColorIndex === idx
                        ? "border-cyan-500"
                        : "border-gray-300"
                    }`}
                    title={v.color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-800">
            <h3 className="mb-3 font-bold">سایز</h3>
            <div className="flex flex-wrap gap-2">
              {["35", "36", "37", "38", "39", "40", "41", "42", "43"].map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`rounded-lg border px-3 py-1 ${
                      selectedSize === s
                        ? "border-cyan-500 bg-cyan-50"
                        : "border-gray-300"
                    }`}
                  >
                    {s}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="fixed inset-x-0 bottom-0 border-t bg-white p-4 dark:bg-gray-800">
        <button
          onClick={handleAddToCart}
          disabled={cartLoading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-cyan-500 py-3 font-bold text-white disabled:opacity-50"
        >
          {cartLoading ? "در حال افزودن..." : "افزودن به سبد خرید"}
        </button>
      </div>
    </div>
  );
}
