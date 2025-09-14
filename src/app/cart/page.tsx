"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Shoe } from "@/types/shoe";

interface CartItem extends Shoe {
  quantity: number; // تعداد جفت‌ها
}

const CartPage = () => {
  const { cartItems, removeItem, updateItemQuantity } = useCart();

  const calculateTotal = (items: CartItem[]) => {
    // اگر price هر جفت باشه
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateSubtotal = () => {
    const total = calculateTotal(cartItems);
    // مالیات و تخفیف مثال
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
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="size-16 rounded-sm object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-sm bg-gray-200 dark:bg-gray-700" />
                  )}
                  <div className="flex-1">
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
                      <div>
                        <dt className="inline">تعداد:</dt>
                        <dd className="inline">
                          {Math.ceil(item.quantity / 10)} کارتن ({item.quantity}{" "}
                          جفت)
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* دکمه‌های افزایش/کاهش کارتن */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateItemQuantity(
                            item.id,
                            Math.max(10, item.quantity - 10),
                          )
                        }
                        disabled={item.quantity <= 10}
                        className="rounded bg-white px-2 py-1 dark:bg-gray-900"
                      >
                        -
                      </button>
                      <span>{Math.ceil(item.quantity / 10)}</span>
                      <button
                        onClick={() =>
                          updateItemQuantity(item.id, item.quantity + 10)
                        }
                        className="rounded bg-white px-2 py-1 dark:bg-gray-900"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-gray-600 transition hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                    >
                      حذف
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex justify-center border-t border-gray-100 pt-8 dark:border-gray-700">
              <div className="w-screen max-w-lg space-y-4">
                <dl className="space-y-0.5 text-sm text-gray-700 dark:text-gray-200">
                  <div className="flex justify-between">
                    <dt>مبلغ کل</dt>
                    <dd className="font-sans">
                      {calculateTotal(cartItems)} تومان
                    </dd>
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
