"use client";

import { useState, useMemo, memo } from "react";
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

const ColorButton = memo(
  ({
    color,
    isActive,
    onClick,
  }: {
    color: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`h-5 w-5 flex-shrink-0 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
        isActive
          ? "border-cyan-500 ring-2 ring-cyan-300 dark:border-cyan-400 dark:ring-cyan-600"
          : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
      }`}
      style={{ backgroundColor: colorMap[color] || "#ccc" }}
      title={color}
      aria-label={`انتخاب رنگ ${color}`}
      aria-pressed={isActive}
    />
  ),
);

ColorButton.displayName = "ColorButton";

const ViewButton = memo(({ shoeId }: { shoeId: number }) => (
  <Link
    href={`/products/${shoeId}`}
    className="flex items-center justify-center rounded-lg border border-gray-300 px-2.5 py-2 text-gray-600 transition-all duration-200 hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-600 active:scale-95 dark:border-gray-600 dark:text-gray-400 dark:hover:border-cyan-500 dark:hover:bg-cyan-900/20 dark:hover:text-cyan-400"
    aria-label={`مشاهده جزئیات`}
  >
    <EyeIcon className="h-5 w-5" />
  </Link>
));

ViewButton.displayName = "ViewButton";

const AddToCartButton = memo(
  ({ loading, onClick }: { loading: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-cyan-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-600 dark:hover:bg-cyan-700"
      aria-label="افزودن به سبد خرید"
      aria-busy={loading}
    >
      {loading ? (
        <div
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"
          role="status"
          aria-label="در حال پردازش"
        />
      ) : (
        <ShoppingCartIcon className="h-5 w-5 flex-shrink-0" />
      )}
    </button>
  ),
);

AddToCartButton.displayName = "AddToCartButton";

const ProductNotFound = memo(() => (
  <div className="group overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-800">
    <div className="flex aspect-square items-center justify-center bg-gray-100 dark:bg-gray-700">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        تصویر موجود نیست
      </span>
    </div>
    <div className="p-4 text-xs text-red-500 dark:text-red-400">
      محصول یافت نشد
    </div>
  </div>
));

ProductNotFound.displayName = "ProductNotFound";

export default memo(function SingleShoe({
  shoe,
  telegramUser,
}: SingleShoeProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const params = useParams();
  const id = params?.id;

  const [selectedVariant, setSelectedVariant] = useState(0);
  const [loading, setLoading] = useState(false);

  const variants = useMemo(() => shoe?.variants || [], [shoe?.variants]);
  const hasVariants = variants.length > 0;
  const variantObj = hasVariants ? variants[selectedVariant] : null;
  const selectedColor = variantObj?.color || shoe?.color || "نامشخص";

  const images = useMemo(
    () =>
      variantObj?.images?.map((img) => img.url) ||
      shoe?.images?.map((img) => img.url) ||
      [],
    [variantObj?.images, shoe?.images],
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
    return <ProductNotFound />;
  }

  return (
    <article
      className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:bg-gray-800 dark:hover:shadow-gray-700/50"
      role="region"
      aria-label={`محصول: ${shoe.name}`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600">
        <Image
          src={selectedImageUrl}
          alt={shoe.name || "تصویر محصول"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          quality={75}
          priority={false}
        />

        {!isCurrentPage && (
          <Link
            href={`/products/${shoe.id}`}
            className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30 dark:group-hover:bg-black/50"
            aria-label={`مشاهده جزئیات ${shoe.name}`}
          >
            <div className="scale-0 transition-transform duration-300 group-hover:scale-100">
              <div className="rounded-full bg-cyan-500 p-3 text-white shadow-lg hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700">
                <EyeIcon className="h-6 w-6" aria-hidden="true" />
              </div>
            </div>
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        {/* ✅ Product Title */}
        <h3 className="line-clamp-2 text-sm font-bold text-gray-900 transition-colors group-hover:text-cyan-600 dark:text-white dark:group-hover:text-cyan-400">
          {shoe.name || "محصول بدون نام"}
        </h3>

        {hasVariants && variants.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              رنگ:
            </span>
            <div className="flex gap-1.5" role="group" aria-label="انتخاب رنگ">
              {variants.map((v, idx) => (
                <ColorButton
                  key={v.id || idx}
                  color={v.color}
                  isActive={selectedVariant === idx}
                  onClick={() => setSelectedVariant(idx)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {(shoe.price || 0).toLocaleString()}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            تومان
          </span>
        </div>

        <div className="flex gap-2 pt-2">
          <AddToCartButton loading={loading} onClick={handleAddToCart} />
          {!isCurrentPage && <ViewButton shoeId={shoe.id} />}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10 dark:border-cyan-400" />
    </article>
  );
});
