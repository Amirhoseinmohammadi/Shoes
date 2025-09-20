"use client";

import { Shoe } from "@/types/shoe";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";

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

const SingleShoe = ({ shoe }: { shoe: Shoe }) => {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [selectedVariant, setSelectedVariant] = useState(0);
  const [cartonCount, setCartonCount] = useState(1);

  const selectedColor = shoe.variants[selectedVariant].color;
  const selectedImage = shoe.variants[selectedVariant].images[0];

  const handleAddToCart = () => {
    const added = addItem(
      {
        ...shoe,
        color: selectedColor,
        image: selectedImage,
      },
      cartonCount * 10,
    );

    if (added) {
      showToast({ message: "محصول به سبد خرید اضافه شد!", type: "success" });
    } else {
      showToast({
        message: `${shoe.name} با رنگ ${selectedColor} قبلاً در سبد خرید موجود است!`,
        type: "warning",
      });
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-xl bg-white shadow-lg transition-transform duration-150 ease-in-out hover:-translate-y-1 hover:shadow-2xl dark:bg-gray-800">
      <div className="relative h-64 overflow-hidden sm:h-72">
        <Image
          src={selectedImage}
          alt={shoe.name}
          fill
          className="object-cover transition-transform duration-200 ease-in-out hover:scale-105"
          priority={selectedVariant === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      <div className="space-y-3 p-6">
        <p className="font-semibold text-gray-700 dark:text-gray-200">
          {(shoe.price * 10).toLocaleString()} تومان / کارتن
        </p>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {shoe.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">{shoe.brand}</p>

        <div className="mt-3 flex gap-2">
          {shoe.variants.map((variant, idx) => (
            <button
              key={variant.color}
              onClick={() => setSelectedVariant(idx)}
              className={`h-8 w-8 rounded-full border-2 transition-transform duration-150 ease-in-out hover:scale-110 active:scale-95 ${
                selectedVariant === idx
                  ? "scale-110 border-blue-500 shadow-md"
                  : "border-gray-300"
              }`}
              style={{ backgroundColor: colorMap[variant.color] || "#ccc" }}
            />
          ))}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <label className="text-sm font-medium">تعداد کارتن:</label>
          <div className="flex items-center overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              type="button"
              onClick={() => setCartonCount((prev) => Math.max(1, prev - 1))}
              className="bg-gray-200 px-3 py-1 transition duration-150 ease-in-out hover:bg-gray-300 active:scale-95 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              −
            </button>
            <input
              type="text"
              value={cartonCount}
              readOnly
              className="w-12 bg-white text-center font-semibold dark:bg-gray-800 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setCartonCount((prev) => prev + 1)}
              className="bg-gray-200 px-3 py-1 transition duration-150 ease-in-out hover:bg-gray-300 active:scale-95 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-4 w-full rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform duration-150 ease-in-out hover:scale-105 hover:shadow-xl active:scale-95"
        >
          افزودن به سبد خرید
        </button>
      </div>
    </div>
  );
};

export default SingleShoe;
