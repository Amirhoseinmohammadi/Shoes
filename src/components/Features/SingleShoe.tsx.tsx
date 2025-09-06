"use client";

import { Shoe } from "@/types/shoe";
import { useCart } from "@/contexts/CartContext";

const SingleShoe = ({ shoe }: { shoe: Shoe }) => {
  const { name, brand, color, size, price, image } = shoe;
  const { addItem } = useCart();

  return (
    <div className="shadow-two w-ful">
      <div className="wow fadeInUp" data-wow-delay=".15s">
        <a href="#" className="group relative block overflow-hidden">
          <button className="absolute end-4 top-4 z-10 rounded-full bg-white p-1.5 text-gray-900 transition hover:text-gray-900/75 dark:bg-gray-700 dark:text-white/75"></button>

          <img
            src={image}
            alt={name}
            className="h-64 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-72"
          />

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
        </a>
      </div>
    </div>
  );
};

export default SingleShoe;
