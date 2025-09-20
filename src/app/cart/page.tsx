"use client";

import { useCart, CartItem } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";
import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";

const formatQuantity = (quantity: number) =>
  quantity >= 10
    ? `${Math.ceil(quantity / 10)} کارتن (${quantity} جفت)`
    : `${quantity} جفت`;

const calculateTotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + (item.price / 10) * item.quantity, 0);
const calculateSubtotal = (items: CartItem[], discount = 2500, tax = 2000) =>
  calculateTotal(items) - discount + tax;

const CartPage = () => {
  const { cartItems, removeItem, updateItemQuantity } = useCart();
  const { showToast } = useToast();

  const handleRemove = (item: CartItem) => {
    showToast({
      message: `آیا از حذف ${item.name} مطمئن هستید؟`,
      type: "warning",
      action: async () => {
        await removeItem(item.id, item.color, item.size);
        showToast({ message: "محصول حذف شد", type: "success" });
      },
      actionLabel: "حذف",
      cancelLabel: "لغو",
    });
  };

  const handleUpdateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 10) return;
    const success = await updateItemQuantity(
      item.id,
      newQuantity,
      item.color,
      item.size,
    );
    if (success !== false) {
      showToast({ message: "تعداد محصول بروزرسانی شد", type: "success" });
    } else {
      showToast({ message: "خطا در بروزرسانی تعداد", type: "error" });
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold dark:text-white">
          سبد خرید شما خالی است
        </h1>
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          برای خرید محصولات، به صفحه اصلی مراجعه کنید.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-gray-700 px-5 py-3 text-sm text-white hover:bg-gray-600 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300"
        >
          صفحه محصولات
        </Link>
      </div>
    );
  }

  return (
    <section className="bg-white py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold dark:text-white">سبد خرید شما</h1>
        </header>

        <ul className="space-y-4">
          {cartItems.map((item) => (
            <li
              key={`${item.id}-${item.size || "nosize"}-${item.color || "nocolor"}`}
              className="flex flex-col items-center gap-4 rounded-lg border p-4 sm:flex-row dark:border-gray-700"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="rounded object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded bg-gray-200 dark:bg-gray-700" />
              )}

              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold dark:text-white">{item.name}</h3>
                <dl className="mt-1 space-y-0.5 text-sm text-gray-600 dark:text-gray-400">
                  {item.brand && (
                    <div>
                      <dt className="inline">برند: </dt>
                      <dd className="inline">{item.brand}</dd>
                    </div>
                  )}
                  {item.color && (
                    <div>
                      <dt className="inline">رنگ: </dt>
                      <dd className="inline">{item.color}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="inline">قیمت: </dt>
                    <dd className="inline">
                      {item.price.toLocaleString()} تومان
                    </dd>
                  </div>
                  <div>
                    <dt className="inline">تعداد: </dt>
                    <dd className="inline">{formatQuantity(item.quantity)}</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-2 flex items-center gap-2 sm:mt-0">
                <button
                  onClick={() => handleUpdateQuantity(item, item.quantity - 10)}
                  disabled={item.quantity <= 10}
                  className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800"
                >
                  -
                </button>
                <span>{Math.ceil(item.quantity / 10)}</span>
                <button
                  onClick={() => handleUpdateQuantity(item, item.quantity + 10)}
                  className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800"
                >
                  +
                </button>

                <button
                  onClick={() => handleRemove(item)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-500"
                  title="حذف"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-8 max-w-lg border-t border-gray-200 pt-6 dark:border-gray-700">
          <div className="space-y-2 text-gray-700 dark:text-gray-200">
            <div className="flex justify-between">
              <dt>مبلغ کل</dt>
              <dd>{calculateTotal(cartItems).toLocaleString()} تومان</dd>
            </div>
            <div className="flex justify-between">
              <dt>مالیات</dt>
              <dd>2,000 تومان</dd>
            </div>
            <div className="flex justify-between">
              <dt>تخفیف</dt>
              <dd>-2,500 تومان</dd>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <dt>مبلغ قابل پرداخت</dt>
              <dd>{calculateSubtotal(cartItems).toLocaleString()} تومان</dd>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/checkout"
              className="inline-block w-full rounded-lg bg-gray-700 px-5 py-3 text-white hover:bg-gray-600 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300"
            >
              ادامه و پرداخت
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
