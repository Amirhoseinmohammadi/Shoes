"use client";

import { Shoe } from "@/types/shoe";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

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
  const { name, brand, price, variants } = shoe;
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [cartonCount, setCartonCount] = useState(1);

  const selectedColor = variants[selectedVariant].color;
  const selectedImage = variants[selectedVariant].images[0];

  const handleAddToCart = () => {
    addItem(
      {
        ...shoe,
        color: selectedColor,
        image: selectedImage,
      },
      cartonCount * 10,
      selectedColor,
    );
  };

  return (
    <div className="shadow-two w-full">
      <img
        src={selectedImage}
        alt={name}
        className="h-64 w-full rounded-t-lg object-cover sm:h-72"
      />

      <div className="relative border border-gray-100 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-700 dark:text-gray-200">
          {(price * 10).toLocaleString()} تومان (هر کارتن)
        </p>

        <h3 className="mt-1.5 text-lg font-medium text-gray-900 dark:text-white">
          {name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">{brand}</p>

        {/* انتخاب رنگ */}
        <div className="mt-3 flex gap-2">
          {variants.map((variant, idx) => (
            <button
              key={variant.color}
              onClick={() => setSelectedVariant(idx)}
              className={`h-8 w-8 rounded-full border-2 transition-transform duration-200 ${
                selectedVariant === idx
                  ? "scale-110 border-gray-900"
                  : "border-gray-300"
              }`}
              style={{ backgroundColor: colorMap[variant.color] || "#ccc" }}
            />
          ))}
        </div>

        {/* تعداد کارتن */}
        <div className="mt-3 flex items-center gap-2">
          <label className="text-sm">تعداد کارتن:</label>
          <div className="flex items-center overflow-hidden rounded border">
            <button
              type="button"
              onClick={() => setCartonCount((prev) => Math.max(1, prev - 1))}
              className="bg-gray-200 px-3 py-1 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              −
            </button>
            <input
              type="text"
              value={cartonCount}
              readOnly
              className="w-12 border-x border-gray-300 text-center dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setCartonCount((prev) => prev + 1)}
              className="bg-gray-200 px-3 py-1 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              +
            </button>
          </div>
        </div>

        {/* دکمه‌ها */}
        <div className="mt-4 flex gap-4">
          <button
            type="button"
            onClick={handleAddToCart}
            className="block w-full rounded-2xl bg-gray-100 px-2 py-4 text-sm font-semibold text-gray-900 transition hover:scale-105 dark:bg-gray-700 dark:text-white"
          >
            افزودن به سبد خرید
          </button>
          <button
            type="button"
            className="block w-full rounded-2xl bg-gray-900 px-2 py-4 text-sm font-semibold text-white transition hover:scale-105 dark:bg-white dark:text-gray-900"
          >
            خرید
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleShoe;
