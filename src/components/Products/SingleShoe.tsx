"use client";
import { useParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";
import { ShoppingCartIcon, EyeIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { Shoe } from "@/types/shoe";

interface SingleShoeProps {
  shoe: Shoe;
  telegramUser?: any; // ✅ اضافه کردن این خط
}

const colorMap: Record<string, string> = {
  سفید: "#FFFFFF",
  مشکی: "#000000",
  کرم: "#F5F5DC",
  آبی: "#007BFF",
  صورتی: "#FFC0CB",
  طوسی: "#808080",
  بنفش: "#800080",
  "مشکی-کرم": "#333300",
};

const SingleShoe = ({ shoe, telegramUser }: SingleShoeProps) => {
  // ✅ اضافه کردن prop
  const { addItem } = useCart();
  const { showToast } = useToast();
  const params = useParams();
  const id = params?.id;

  const [selectedVariant, setSelectedVariant] = useState(0);
  const [cartonCount, setCartonCount] = useState(1);
  const [loading, setLoading] = useState(false);

  // ✅ استفاده از telegramUser اگر نیاز داری
  console.log("Telegram User in SingleShoe:", telegramUser);

  if (!shoe?.variants?.length) {
    return <div>اطلاعات محصول ناقص است.</div>;
  }

  const variantObj = shoe.variants[selectedVariant];
  const selectedColor = variantObj.color;

  const images = variantObj.images?.map((img) => img.url) || [];
  const selectedImageUrl = images[0] || "/images/default-shoe.png";
  const isCurrentPage = id?.toString() === shoe.id.toString(); // ✅ بهبود منطق

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const success = await addItem({
        shoe: { ...shoe, image: selectedImageUrl },
        quantity: cartonCount * 10,
        color: selectedColor,
        telegramUserId: telegramUser?.id, // ✅ اضافه کردن اطلاعات تلگرام
      });

      showToast({
        message: success
          ? `${shoe.name} (${selectedColor}) به سبد خرید اضافه شد!` +
            (telegramUser ? ` - کاربر: ${telegramUser.first_name}` : "")
          : "خطا در افزودن به سبد خرید. لطفاً دوباره تلاش کنید.",
        type: success ? "success" : "error",
      });
    } catch (err) {
      console.error(err);
      showToast({
        message: "خطا در افزودن به سبد خرید. لطفاً دوباره تلاش کنید.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-xl bg-white shadow-lg transition-transform duration-150 ease-in-out hover:-translate-y-1 hover:shadow-2xl dark:bg-gray-800">
      {/* ✅ نمایش وضعیت تلگرام */}
      {telegramUser && (
        <div className="absolute top-2 left-2 z-10 rounded-full bg-green-500 px-2 py-1 text-xs text-white">
          📱
        </div>
      )}

      <div className="relative h-64 overflow-hidden sm:h-72">
        <Image
          src={selectedImageUrl}
          alt={shoe.name}
          fill
          className="object-cover transition-transform duration-200 ease-in-out hover:scale-105"
          priority={selectedVariant === 0}
        />
      </div>

      <div className="space-y-3 p-6">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-700 dark:text-gray-200">
            {shoe.price.toLocaleString()} تومان / کارتن
          </p>
          {telegramUser && (
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              تخفیف تلگرام
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {shoe.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">{shoe.brand}</p>
        {shoe.description && (
          <p className="text-gray-500 dark:text-gray-400">{shoe.description}</p>
        )}

        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            رنگ انتخابی:
          </span>
          {shoe.variants.map((v, idx) => (
            <button
              key={v.id}
              onClick={() => setSelectedVariant(idx)}
              className={`h-8 w-8 rounded-full border-2 transition-transform duration-150 ease-in-out hover:scale-110 active:scale-95 ${
                selectedVariant === idx
                  ? "scale-110 border-blue-500 shadow-md"
                  : "border-gray-300"
              }`}
              style={{ backgroundColor: colorMap[v.color] || "#ccc" }}
              title={v.color}
            />
          ))}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <label className="text-sm font-medium">تعداد کارتن:</label>
          <div className="flex items-center overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setCartonCount((prev) => Math.max(1, prev - 1))}
              className="bg-gray-200 px-3 py-1 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              disabled={cartonCount <= 1}
            >
              −
            </button>
            <input
              type="text"
              value={cartonCount}
              readOnly
              className="w-12 bg-white text-center dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={() => setCartonCount((prev) => prev + 1)}
              className="bg-gray-200 px-3 py-1 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              +
            </button>
          </div>
          <span className="text-xs text-gray-500">
            ({cartonCount * 10} جفت)
          </span>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-xl disabled:opacity-60"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                <ShoppingCartIcon className="h-5 w-5" />
                {telegramUser ? "📱 افزودن" : "افزودن به سبد خرید"}
              </>
            )}
          </button>

          {!isCurrentPage && (
            <Link
              href={`/products/${shoe.id}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:scale-105 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <EyeIcon className="h-5 w-5" />
              مشاهده محصول
            </Link>
          )}
        </div>

        {telegramUser && (
          <div className="mt-3 rounded-lg bg-green-50 p-2 text-center dark:bg-green-900/20">
            <p className="text-xs text-green-700 dark:text-green-300">
              کاربر تلگرام: {telegramUser.first_name}
              {telegramUser.username && ` (@${telegramUser.username})`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleShoe;
