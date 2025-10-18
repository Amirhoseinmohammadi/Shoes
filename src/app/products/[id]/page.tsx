"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";
import Link from "next/link";

export default function ProductPage() {
  const { id } = useParams();
  const productId = id ? parseInt(id as string) : undefined;
  const { data: product, error, isLoading } = useApi.useProduct(productId!);
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-4 pb-32">
        <div className="mx-auto max-w-2xl px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-80 rounded-2xl bg-gray-300"></div>
            <div className="h-8 w-1/2 rounded bg-gray-300"></div>
            <div className="h-6 w-1/3 rounded bg-gray-300"></div>
            <div className="space-y-3">
              <div className="h-4 rounded bg-gray-300"></div>
              <div className="h-4 rounded bg-gray-300"></div>
              <div className="h-4 w-2/3 rounded bg-gray-300"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 pb-32">
        <div className="text-center">
          <svg
            className="mx-auto mb-2 h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            خطا در دریافت محصول
          </h2>
          <p className="text-gray-600">
            {error?.message || "لطفاً بعداً دوباره تلاش کنید"}
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 pb-32">
        <div className="text-center">
          <p className="text-gray-600">محصولی یافت نشد</p>
        </div>
      </div>
    );
  }

  const variants = product.variants || [];
  const currentVariant = variants[selectedColor] || null;
  const images =
    currentVariant?.images?.map((img) => img.url) ||
    product.images?.map((img) => img.url) ||
    [];
  const displayImage = images[currentImageIndex] || "/images/default-shoe.png";
  const sizes = ["35", "36", "37", "38", "39", "40", "41", "42", "43"];

  const handleAddToCart = async () => {
    if (!selectedSize) {
      showToast({ message: "لطفاً سایز انتخاب کنید", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const success = await addItem({
        shoe: {
          ...product,
          image: displayImage,
          name: product.name || "محصول",
          price: product.price || 0,
        },
        quantity,
        color: currentVariant?.color || product.color || "نامشخص",
      });

      showToast({
        message: success ? "محصول به سبد خرید اضافه شد" : "خطا در افزودن",
        type: success ? "success" : "error",
      });
    } catch (err) {
      showToast({ message: "خطا در افزودن به سبد خرید", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* Header */}

        <div className="mb-6 flex items-center justify-end align-middle">
          <span> بازگشت</span>
          <Link
            href="/"
            className="rounded-lg p-2 transition hover:bg-gray-200"
          >
            <svg
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
        </div>

        {/* Product Image */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-white p-4 shadow-sm">
          <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-gray-100">
            <Image
              src={displayImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>

          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    currentImageIndex === idx
                      ? "border-cyan-500"
                      : "border-gray-200"
                  }`}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          {/* Name & Price */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              {product.name}
            </h2>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {(product.price || 0).toLocaleString()} تومان
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Available Colors */}
          {variants.length > 0 && (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-bold text-gray-900">رنگ موجود</h3>
              <div className="flex gap-3">
                {variants.map((variant, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(idx)}
                    className={`h-12 w-12 rounded-full border-4 transition ${
                      selectedColor === idx
                        ? "border-cyan-500 ring-2 ring-cyan-200"
                        : "border-gray-300"
                    }`}
                    style={{
                      backgroundColor:
                        variant.color === "سفید"
                          ? "#FFFFFF"
                          : variant.color === "مشکی"
                            ? "#000000"
                            : variant.color === "نارنجی"
                              ? "#FF8C00"
                              : variant.color === "قرمز"
                                ? "#EF4444"
                                : "#ccc",
                    }}
                    title={variant.color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h3 className="mb-2 font-bold text-gray-900">توضیحات</h3>
            <p className="text-sm leading-relaxed text-gray-600">
              {product.description || "توضیحی موجود نیست"}
            </p>
          </div>

          {/* Reviews */}
          {product.reviews && product.reviews.length > 0 && (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-bold text-gray-900">نظرات</h3>
              <div className="space-y-3">
                {product.reviews.slice(0, 2).map((review, idx) => (
                  <div
                    key={idx}
                    className="border-b border-gray-200 pb-3 last:border-b-0"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-300"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {review.author || "کاربر"}
                        </p>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-3 w-3 ${i < (review.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed right-0 bottom-0 left-0 flex gap-2 border-t border-gray-200 bg-white px-4 py-3 pb-6">
        <button className="flex-1 rounded-full border-2 border-cyan-500 py-3 font-bold text-cyan-500 transition hover:bg-cyan-50">
          <svg
            className="mx-auto h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
        </button>
        <button
          onClick={handleAddToCart}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-cyan-500 py-3 font-bold text-white transition hover:bg-cyan-600 disabled:opacity-50"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            <>
              <svg
                className="h-5 w-5"
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
              افزودن به سبد
            </>
          )}
        </button>
      </div>
    </div>
  );
}
