"use client";

import { Shoe } from "@/types/shoe";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

const SingleShoe = ({ shoe }: { shoe: Shoe }) => {
  const { name, brand, color, size, price, image } = shoe;
  const { addItem } = useCart();

  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const [cartonCount, setCartonCount] = useState(1);

  const handleAddToCart = () => {
    if (!selectedColor) {
      alert("لطفا رنگ را انتخاب کنید");
      return;
    }

    addItem(
      { ...shoe, color: selectedColor },
      cartonCount * 10, // هر کارتن ۱۰ جفت
    );
  };

  return (
    <div className="shadow-two w-full">
      <img
        src={image}
        alt={name}
        className="h-64 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-72"
      />

      <div className="relative border border-gray-100 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-700 dark:text-gray-200">
          {(price * 10).toLocaleString()} تومان (هر کارتن)
        </p>

        <h3 className="mt-1.5 text-lg font-medium text-gray-900 dark:text-white">
          {name}
        </h3>

        <p className="text-gray-600 dark:text-gray-300">سایز: {size}</p>

        <div className="mt-2 flex gap-2">
          {["قرمز", "آبی", "مشکی"].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedColor(c)}
              className={`rounded-lg border px-3 py-1 ${
                selectedColor === c ? "bg-gray-900 text-white" : "bg-gray-100"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <label className="text-sm">تعداد کارتن:</label>
          <input
            type="number"
            value={cartonCount}
            onChange={(e) => setCartonCount(Number(e.target.value))}
            min={1}
            className="ml-2 w-16 rounded border px-2 py-1 dark:bg-gray-700 dark:text-white"
          />
        </div>

<<<<<<< HEAD:src/components/Features/SingleShoe.tsx.tsx
        <form className="mt-4 flex gap-4">
          <button
            type="button"
            onClick={handleAddToCart}
            className="block w-full rounded-2xl bg-gray-100 px-2 py-4 text-sm font-semibold text-gray-900 transition hover:scale-105 dark:bg-gray-700 dark:text-white"
          >
            افزودن به سبد خرید
          </button>
        </form>
=======
          <div className="relative border border-gray-100 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-700 dark:text-gray-200">
              {price}
              <span className="text-gray-400 line-through dark:text-gray-500"></span>
            </p>

            <h3 className="mt-1.5 text-lg font-medium text-gray-900 dark:text-white">
              {name}
            </h3>

            <p className="mt-1.5 line-clamp-3 text-gray-700 dark:text-gray-200">
              {brand} • {color}
            </p>

            <form className="mt-4 flex gap-4">
              <button
                type="button"
                onClick={() => addItem(shoe)}
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
            </form>
          </div>
        </div>
>>>>>>> 23049b6e7e66b5d93137516b662b608891d41710:src/components/Products/SingleShoe.tsx.tsx
      </div>
    </div>
  );
};

export default SingleShoe;
