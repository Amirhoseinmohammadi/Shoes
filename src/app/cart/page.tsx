"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Shoe } from "@/types/shoe";

const CartPage = () => {
  const { cartItems, removeItem, updateItemQuantity } = useCart();

  const calculateTotal = (items: Shoe[]) => {
    return items.reduce((total, item) => total + parseFloat(item.price), 0);
  };

  const calculateSubtotal = () => {
    const total = calculateTotal(cartItems);
    return total - 2500 - 2000;
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-xl font-bold text-gray-900 sm:text-3xl dark:text-white">
            سبد خرید شما خالی است
          </h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            برای خرید محصولات، به صفحه اصلی مراجعه کنید.
          </p>
          <Link
            href="/"
            className="mt-6 block rounded-lg bg-gray-700 px-5 py-3 text-sm text-gray-100 transition hover:bg-gray-600"
          >
            صفحه محصولات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <header className="text-center">
            <h1 className="text-xl font-bold text-gray-900 sm:text-3xl dark:text-white">
              سبد خرید شما
            </h1>
          </header>

          <div className="mt-8">
            <ul className="space-y-4">
              {cartItems.map((item) => (
                <li key={item.id} className="flex items-center gap-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="size-16 rounded-sm object-cover"
                  />
                  <div>
                    <h3 className="text-sm text-gray-900 dark:text-white">
                      {item.name}
                    </h3>
                    <dl className="mt-0.5 space-y-px text-[10px] text-gray-600 dark:text-gray-400">
                      <div>
                        <dt className="inline">برند:</dt>
                        <dd className="inline">{item.brand}</dd>
                      </div>
                      <div>
                        <dt className="inline">رنگ:</dt>
                        <dd className="inline">{item.color}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="flex flex-1 items-center justify-end gap-2">
                    <button
                      onClick={() => removeItem(item)}
                      className="text-gray-600 transition hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                    >
                      <span className="sr-only">حذف محصول</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex justify-end border-t border-gray-100 pt-8 dark:border-gray-700">
              <div className="w-screen max-w-lg space-y-4">
                <dl className="space-y-0.5 text-sm text-gray-700 dark:text-gray-200">
                  <div className="flex justify-between">
                    <dt>مبلغ کل</dt>
                    <dd>{calculateTotal(cartItems)} تومان</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>مالیات</dt>
                    <dd>2000 تومان</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>تخفیف</dt>
                    <dd>-2500 تومان</dd>
                  </div>
                  <div className="flex justify-between !text-base font-medium">
                    <dt>مبلغ قابل پرداخت</dt>
                    <dd>{calculateSubtotal()} تومان</dd>
                  </div>
                </dl>
                <div className="flex justify-end">
                  <a
                    href="#"
                    className="block rounded-lg bg-gray-700 px-5 py-3 text-sm text-gray-100 transition hover:bg-gray-600 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300"
                  >
                    ادامه و پرداخت
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
