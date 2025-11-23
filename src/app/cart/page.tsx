"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";
import Link from "next/link";
import CheckoutModal from "@/components/CheckoutModal";

interface CartItemType {
  id: number;
  productId: number;
  name: string;
  brand?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

interface CheckoutCustomer {
  name: string;
  phone: string;
}

const formatQuantity = (quantity: number) =>
  quantity >= 10 ? `${Math.ceil(quantity / 10)} کارتن` : `${quantity} جفت`;

/**
 */
const calculateTotal = (items: CartItemType[]) =>
  items.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;

    return total + price * quantity;
  }, 0);

const calculateFinalAmount = (
  items: CartItemType[],
  discount = 2500,
  tax = 2000,
  telegramDiscount = 0,
) => {
  const total = calculateTotal(items);

  const finalDiscount = Number(discount) || 0;
  const finalTax = Number(tax) || 0;
  const finalTelegramDiscount = Number(telegramDiscount) || 0;

  return total - finalDiscount - finalTelegramDiscount + finalTax;
};

const CartItemCard = ({ item, loading, onUpdateQuantity, onRemove }: any) => {
  const displayColor = (() => {
    switch (item.color) {
      case "سفید":
        return "#FFFFFF";
      case "مشکی":
        return "#000000";
      case "نارنجی":
      case "قرمز": // EF4444
        return "#EF4444";
      default:
        return "#ccc";
    }
  })();

  const quantityIncrement = 10;

  const itemPrice = Number(item.price) || 0;
  const itemQuantity = Number(item.quantity) || 0;
  const itemTotal = itemPrice * itemQuantity;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-gray-800 dark:hover:shadow-lg">
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
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-200 dark:bg-gray-700" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-gray-900 dark:text-white">
            {item.name}
          </h3>
          {item.brand && (
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              برند: {item.brand}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            قیمت واحد (کارتن): {itemPrice.toLocaleString()} تومان
          </p>
        </div>

        <div className="text-right">
          <p className="font-bold text-gray-900 dark:text-white">
            {itemTotal.toLocaleString()}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">تومان</p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {formatQuantity(itemQuantity)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            تعداد کارتن:
          </span>
          <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
            <button
              onClick={() =>
                onUpdateQuantity(
                  item.id,
                  Math.max(0, itemQuantity - quantityIncrement),
                )
              }
              disabled={itemQuantity <= quantityIncrement || loading}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-white hover:text-gray-800 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-white">
              {Math.ceil(itemQuantity / quantityIncrement)}
            </span>
            <button
              onClick={() =>
                onUpdateQuantity(item.id, itemQuantity + quantityIncrement)
              }
              disabled={loading}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-white hover:text-gray-800 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={() => onRemove(item.id)}
          disabled={loading}
          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        >
          حذف
        </button>
      </div>
    </div>
  );
};

const CartPage = () => {
  const {
    cartItems,
    removeItem,
    updateItemQuantity,
    checkout,
    loading,
    telegramUser,
  } = useCart();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  const handleRemove = async (itemId: number) => {
    if (loading) return;

    showToast({
      message: "آیا از حذف این محصول مطمئن هستید؟",
      type: "warning",
      action: async () => {
        const success = await removeItem(itemId);
        showToast({
          message: success ? "محصول حذف شد" : "خطا در حذف محصول",
          type: success ? "success" : "error",
        });
      },
      actionLabel: "حذف",
      cancelLabel: "لغو",
    });
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (loading) return;
    if (newQuantity <= 0) return handleRemove(itemId);

    const success = await updateItemQuantity(itemId, newQuantity);
    if (!success) {
      showToast({
        message: "خطا در به‌روزرسانی تعداد",
        type: "error",
      });
    }
  };

  const handleConfirmOrder = async (customer: CheckoutCustomer) => {
    const success = await checkout(customer);

    if (success) {
      showToast({
        message: "سفارش با موفقیت ثبت شد! سبد خرید شما خالی شد.",
        type: "success",
      });

      setModalOpen(false);
    } else {
      showToast({
        message: "خطا در ثبت سفارش",
        type: "error",
      });
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="safe-area-bottom flex min-h-screen items-center justify-center bg-gray-200 dark:bg-gray-900">
        <div className="px-4 text-center">
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
            مشاهده محصولات
          </Link>
        </div>
      </div>
    );
  }

  const total = calculateTotal(cartItems as CartItemType[]);
  const discount = 2500;
  const tax = 2000;
  const telegramDiscount = telegramUser ? 1000 : 0;
  const finalAmount = calculateFinalAmount(
    cartItems as CartItemType[],
    discount,
    tax,
    telegramDiscount,
  );

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl space-y-3 px-4 py-4 pb-8">
        {cartItems.map((item) => (
          <CartItemCard
            key={item.id}
            item={item}
            loading={loading}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemove}
          />
        ))}

        <div className="rounded-2xl border-t border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 space-y-3 text-sm">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>
                مبلغ کل ({cartItems.reduce((sum, i) => sum + i.quantity, 0)}{" "}
                جفت)
              </span>
              <span>{total.toLocaleString()} تومان</span>
            </div>
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>تخفیف</span>
              <span>-{discount.toLocaleString()} تومان</span>
            </div>
            {telegramUser && (
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
