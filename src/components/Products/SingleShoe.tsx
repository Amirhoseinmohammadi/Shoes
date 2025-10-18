"use client";
import { useParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";
import Link from "next/link";
import { Shoe } from "@/types/shoe";

interface SingleShoeProps {
  shoe: Shoe;
  telegramUser?: any;
}

const SingleShoe = ({ shoe, telegramUser }: SingleShoeProps) => {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const params = useParams();
  const id = params?.id;

  const [selectedVariant, setSelectedVariant] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const variants = shoe?.variants || [];
  const hasVariants = variants.length > 0;

  const variantObj = hasVariants ? variants[selectedVariant] : null;
  const selectedColor = variantObj?.color || shoe?.color || "نامشخص";

  const images =
    variantObj?.images?.map((img) => img.url) ||
    shoe?.images?.map((img) => img.url) ||
    [];
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
        quantity: 10,
        color: selectedColor,
      });

      showToast({
        message: success
          ? `${shoe.name || "محصول"} به سبد خرید اضافه شد!`
          : "خطا در افزودن به سبد خرید",
        type: success ? "success" : "error",
      });
    } catch (err) {
      showToast({
        message: "خطا در افزودن به سبد خرید",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!shoe || !shoe.id) {
    return (
      <div className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg">
        <div className="flex aspect-square items-center justify-center bg-gray-100">
          <span className="text-sm text-gray-500">تصویر موجود نیست</span>
        </div>
        <div className="p-4">
          <div className="text-xs text-red-500">محصول یافت نشد</div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
        <Image
          src={selectedImageUrl}
          alt={shoe.name || "محصول"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/10"></div>

        {/* Badge */}
        {shoe.discount && (
          <div className="absolute top-3 right-3 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
            {shoe.discount}% تخفیف
          </div>
        )}

        {/* Quick View Button - Appears on Hover */}
        {!isCurrentPage && (
          <Link
            href={`/products/${shoe.id}`}
            className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/40"
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

      {/* Product Info */}
      <div className="p-4 transition-all duration-300">
        {/* Product Name */}
        <h3 className="mb-2 line-clamp-2 text-sm font-bold text-gray-900 transition-colors group-hover:text-cyan-600">
          {shoe.name || "محصول بدون نام"}
        </h3>

        {/* Color Selection */}
        {hasVariants && variants.length > 1 && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">رنگ:</span>
            <div className="flex gap-1.5">
              {variants.map((v, idx) => (
                <button
                  key={v.id || idx}
                  onClick={() => setSelectedVariant(idx)}
                  className={`h-5 w-5 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                    selectedVariant === idx
                      ? "border-cyan-500 ring-2 ring-cyan-300"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={{
                    backgroundColor:
                      v.color === "سفید"
                        ? "#FFFFFF"
                        : v.color === "مشکی"
                          ? "#000000"
                          : v.color === "کرم"
                            ? "#F5F5DC"
                            : v.color === "آبی"
                              ? "#007BFF"
                              : v.color === "قرمز"
                                ? "#EF4444"
                                : "#ccc",
                  }}
                  title={v.color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            {(shoe.price || 0).toLocaleString()} تومان
          </span>
          {shoe.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {shoe.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 py-2.5 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-cyan-600 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </>
            )}
          </button>

          {!isCurrentPage && (
            <Link
              href={`/products/${shoe.id}`}
              className="flex items-center justify-center rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 transition-all duration-300 hover:border-cyan-500 hover:bg-gray-50 hover:text-cyan-600"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Animated Border on Hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
    </div>
  );
};

export default SingleShoe;
