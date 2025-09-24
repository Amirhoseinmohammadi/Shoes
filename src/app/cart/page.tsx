"use client";

import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";
import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";

const formatQuantity = (quantity: number) =>
  quantity >= 10
    ? `${Math.ceil(quantity / 10)} کارتن (${quantity} جفت)`
    : `${quantity} جفت`;

const calculateTotal = (items: any[]) =>
  items.reduce((total, item) => total + (item.price / 10) * item.quantity, 0);
const calculateSubtotal = (items: any[], discount = 2500, tax = 2000) =>
  calculateTotal(items) - discount + tax;

const CartPage = () => {
  const { cartItems, removeItem, updateItemQuantity, loading } = useCart();
  const { showToast } = useToast();

  const handleRemove = async (item: any) => {
    if (loading) return; // جلوگیری از درخواست‌های متوالی

    showToast({
      message: `آیا از حذف ${item.name} مطمئن هستید؟`,
      type: "warning",
      action: async () => {
        const success = await removeItem(item.id);
        if (success) {
          showToast({ message: "محصول حذف شد", type: "success" });
        } else {
          showToast({ message: "خطا در حذف محصول", type: "error" });
        }
      },
      actionLabel: "حذف",
      cancelLabel: "لغو",
    });
  };

  const handleUpdateQuantity = async (item: any, newQuantity: number) => {
    if (loading) return; // جلوگیری از درخواست‌های متوالی

    if (newQuantity <= 0) {
      return handleRemove(item);
    }

    const success = await updateItemQuantity(item.id, newQuantity);
    if (success) {
      showToast({ message: "تعداد محصول بروزرسانی شد", type: "success" });
    } else {
      showToast({ message: "خطا در بروزرسانی تعداد", type: "error" });
    }
  };

  const getItemDisplayInfo = (item: any) => {
    const baseInfo = `برند: ${item.brand}`;
    const priceInfo = `قیمت: ${item.price.toLocaleString()} تومان`;
    const quantityInfo = `تعداد: ${formatQuantity(item.quantity)}`;

    let variants = [];
    if (item.color) variants.push(`رنگ: ${item.color}`);
    if (item.size) variants.push(`سایز: ${item.size}`);

    return {
      baseInfo,
      priceInfo,
      quantityInfo,
      variants,
      hasVariants: variants.length > 0,
    };
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
          {loading && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              در حال بروزرسانی...
            </p>
          )}
        </header>

        <ul className="space-y-4">
          {cartItems.map((item) => {
            const displayInfo = getItemDisplayInfo(item);

            return (
              <li
                key={item.id}
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

                  {/* اطلاعات اصلی */}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>{displayInfo.baseInfo}</p>
                    <p>{displayInfo.priceInfo}</p>
                    <p>{displayInfo.quantityInfo}</p>
                  </div>

                  {/* نمایش ویژگی‌ها (رنگ و سایز) */}
                  {displayInfo.hasVariants && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {displayInfo.variants.map((variant, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {variant}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-2 sm:mt-0">
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item, item.quantity - 10)
                    }
                    disabled={item.quantity <= 10 || loading}
                    className="rounded bg-gray-100 px-2 py-1 disabled:opacity-50 dark:bg-gray-800"
                  >
                    -
                  </button>
                  <span className="min-w-[2rem] text-center">
                    {Math.ceil(item.quantity / 10)}
                  </span>
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item, item.quantity + 10)
                    }
                    disabled={loading}
                    className="rounded bg-gray-100 px-2 py-1 disabled:opacity-50 dark:bg-gray-800"
                  >
                    +
                  </button>

                  <button
                    onClick={() => handleRemove(item)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-500"
                    title="حذف"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </li>
            );
          })}
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
