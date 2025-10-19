"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";
import Link from "next/link";
import { Shoe } from "@/types/shoe";
import { ShoppingCartIcon, EyeIcon } from "@heroicons/react/24/outline";

const colorMap: Record<string, string> = {
  سفید: "#FFFFFF",
  مشکی: "#000000",
  کرم: "#F5F5DC",
  آبی: "#007BFF",
  قرمز: "#EF4444",
};

interface SingleShoeProps {
  shoe: Shoe;
  telegramUser?: any;
}

export default function SingleShoe({ shoe, telegramUser }: SingleShoeProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const params = useParams();
  const id = params?.id;

  const [selectedVariant, setSelectedVariant] = useState(0);
  const [loading, setLoading] = useState(false);

  const variants = useMemo(() => shoe?.variants || [], [shoe]);
  const hasVariants = variants.length > 0;
  const variantObj = hasVariants ? variants[selectedVariant] : null;
  const selectedColor = variantObj?.color || shoe?.color || "نامشخص";

  const images = useMemo(
    () =>
      variantObj?.images?.map((img) => img.url) ||
      shoe?.images?.map((img) => img.url) ||
      [],
    [variantObj, shoe],
  );

  const selectedImageUrl = images[0] || "/images/default-shoe.png";
  const isCurrentPage = id?.toString() === shoe?.id?.toString();

  const handleAddToCart = async () => {
    if (!shoe) return;
    setLoading(true);

    try {
      const success = await addItem({
        shoe: {
          ...shoe,
          image: selectedImageUrl,
          name: shoe.name || "محصول بدون نام",
          price: shoe.price || 0,
        },
        quantity: 1,
        color: selectedColor,
      });

      showToast({
        message: success
          ? `${shoe.name || "محصول"} به سبد خرید اضافه شد ✅`
          : "خطا در افزودن به سبد خرید ❌",
        type: success ? "success" : "error",
      });
    } catch {
      showToast({
        message: "خطا در افزودن به سبد خرید ❌",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!shoe?.id) {
    return (
      <div className="group overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex aspect-square items-center justify-center bg-gray-100">
          <span className="text-sm text-gray-500">تصویر موجود نیست</span>
        </div>
        <div className="p-4 text-xs text-red-500">محصول یافت نشد</div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
        <Image
          src={selectedImageUrl}
          alt={shoe.name || "محصول"}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {!isCurrentPage && (
          <Link
            href={`/products/${shoe.id}`}
            className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30"
          >
            <div className="scale-0 transition-transform duration-300 group-hover:scale-100">
              <div className="rounded-full bg-cyan-500 p-3 text-white shadow-lg hover:bg-cyan-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
            </div>
          </Link>
        )}
      </div>

      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 text-sm font-bold text-gray-900 transition-colors group-hover:text-cyan-600">
          {shoe.name || "محصول بدون نام"}
        </h3>

        {hasVariants && variants.length > 1 && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">رنگ:</span>
            <div className="flex gap-1.5">
              {variants.map((v, idx) => {
                const bgColor = colorMap[v.color] || "#ccc";
                const isActive = selectedVariant === idx;

                return (
                  <button
                    key={v.id || idx}
                    onClick={() => setSelectedVariant(idx)}
                    className={`h-5 w-5 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                      isActive
                        ? "border-cyan-500 ring-2 ring-cyan-300"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: bgColor }}
                    title={v.color}
                    aria-label={`انتخاب رنگ ${v.color}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            {(shoe.price || 0).toLocaleString()} تومان
          </span>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-cyan-600 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <ShoppingCartIcon className="h-5 w-5" />
              </>
            )}
          </button>

          {!isCurrentPage && (
            <Link
              href={`/products/${shoe.id}`}
              className="flex items-center justify-center rounded-lg border border-gray-300 px-2.5 py-2 text-gray-600 transition-all duration-200 hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-600 active:scale-95"
            >
              <EyeIcon className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
    </div>
  );
}
