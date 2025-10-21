"use client";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { useTelegram } from "@/hooks/useTelegram";
import Image from "next/image";
import Link from "next/link";
import CheckoutModal from "@/components/CheckoutModal";

const formatQuantity = (quantity: number) =>
  quantity >= 10 ? `${Math.ceil(quantity / 10)} کارتن` : `${quantity} جفت`;

const calculateTotal = (items: any[]) =>
  items.reduce((total, item) => total + (item.price / 10) * item.quantity, 0);

const calculateSubtotal = (items: any[], discount = 2500, tax = 2000) =>
  calculateTotal(items) - discount + tax;

const CartPage = () => {
  const { cartItems, removeItem, updateItemQuantity, checkout, loading } =
    useCart();
  const { showToast } = useToast();
  const { user: telegramUser, sendData, isTelegram } = useTelegram();
  const [modalOpen, setModalOpen] = useState(false);

  const handleRemove = async (item: any) => {
    if (loading) return;

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
    if (loading) return;

    if (newQuantity <= 0) {
      return handleRemove(item);
    }

    await updateItemQuantity(item.id, newQuantity);
  };

  const handleConfirmOrder = async (customer: {
    name: string;
    phone: string;
    orderId?: number;
    trackingCode?: string;
  }) => {
    const orderData = {
      ...customer,
      telegramUserId: telegramUser?.id,
      telegramUsername: telegramUser?.username,
      items: cartItems,
      totalAmount: finalAmount,
    };

    const success = await checkout(orderData);

    if (success) {
      showToast({
        message: `سفارش با موفقیت ثبت شد! کد پیگیری: ${customer.trackingCode || "در حال پردازش"}`,
        type: "success",
      });

      if (isTelegram) {
        sendData({
          action: "order_created",
          order: orderData,
          success: true,
        });
      }

      setModalOpen(false);
    } else {
      showToast({ message: "خطا در ثبت سفارش", type: "error" });
    }
  };

  const total = calculateTotal(cartItems);
  const discount = 2500;
  const tax = 2000;
  const telegramDiscount = isTelegram ? 1000 : 0;
  const finalAmount = total - discount - telegramDiscount + tax;

  if (cartItems.length === 0) {
    return (
      <div className="safe-area-bottom flex min-h-screen items-center justify-center bg-gray-200 dark:bg-gray-900">
        <div className="px-4 text-center">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            سبد خرید خالی است
          </h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            برای شروع خرید، محصولات را انتخاب کنید
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 font-bold text-white transition hover:bg-cyan-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
            مشاهده محصولات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900">
      <div className="safe-area-top flex items-center gap-3 bg-white px-4 py-3 shadow-lg dark:bg-gray-800">
        <h1 className="flex-1 text-xl font-bold text-gray-900 dark:text-white">
          سبد خرید
        </h1>
        <span className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
          {cartItems.length} محصول
        </span>
        <Link
          href="/"
          className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-4 pb-8">
        <div className="mb-8 space-y-3">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-gray-800 dark:hover:shadow-lg"
            >
              <div className="mb-4 flex gap-4">
                <div className="flex-shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-200 dark:bg-gray-700">
                      <svg
                        className="h-8 w-8 text-gray-400 dark:text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    برند: {item.brand}
                  </p>

                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    قیمت واحد: {(item.price || 0).toLocaleString()} تومان
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.size && (
                      <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        سایز: {item.size}
                      </span>
                    )}
                    {item.color && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          رنگ:
                        </span>
                        <div
                          className="h-4 w-4 rounded-full border border-gray-300 dark:border-gray-600"
                          style={{
                            backgroundColor:
                              item.color === "سفید"
                                ? "#FFFFFF"
                                : item.color === "مشکی"
                                  ? "#000000"
                                  : item.color === "نارنجی"
                                    ? "#FF8C00"
                                    : item.color === "قرمز"
                                      ? "#EF4444"
                                      : "#ccc",
                          }}
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {item.color}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {((item.price / 10) * item.quantity).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    تومان
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {formatQuantity(item.quantity)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    تعداد:
                  </span>
                  <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item, item.quantity - 10)
                      }
                      disabled={item.quantity <= 10 || loading}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-white hover:text-gray-800 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-white">
                      {Math.ceil(item.quantity / 10)}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item, item.quantity + 10)
                      }
                      disabled={loading}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-white hover:text-gray-800 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    ({item.quantity} جفت)
                  </span>
                </div>

                <button
                  onClick={() => handleRemove(item)}
                  disabled={loading}
                  className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border-t border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 space-y-3 text-sm">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>
                مبلغ کل (
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)} جفت)
              </span>
              <span>{total.toLocaleString()} تومان</span>
            </div>

            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>تخفیف</span>
              <span>-{discount.toLocaleString()} تومان</span>
            </div>

            {isTelegram && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>تخفیف تلگرام</span>
                <span>-{telegramDiscount.toLocaleString()} تومان</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>مالیات و حمل</span>
              <span>+{tax.toLocaleString()} تومان</span>
            </div>

            <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold text-gray-900 dark:border-gray-600 dark:text-white">
              <span>قابل پرداخت</span>
              <span>{finalAmount.toLocaleString()} تومان</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/products"
              className="flex-1 rounded-full border-2 border-cyan-500 py-3 text-center font-bold text-cyan-500 transition hover:bg-cyan-50 dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-cyan-900/20"
            >
              خرید بیشتر
            </Link>
            <button
              disabled={loading || cartItems.length === 0}
              onClick={() => setModalOpen(true)}
              className="flex-1 rounded-full bg-cyan-500 py-3 font-bold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-600 dark:hover:bg-cyan-700"
            >
              {loading ? "در حال پردازش..." : "تکمیل سفارش"}
            </button>
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmOrder}
        cartItems={cartItems}
        totalPrice={finalAmount}
        telegramUser={telegramUser}
      />
    </div>
  );
};

export default CartPage;
