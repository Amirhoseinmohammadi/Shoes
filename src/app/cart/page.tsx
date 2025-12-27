"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";
import Link from "next/link";
import CheckoutModal from "@/components/CheckoutModal";

/* ================= HELPERS ================= */

const formatQuantity = (quantity: number) =>
  quantity >= 10 ? `${Math.ceil(quantity / 10)} کارتن` : `${quantity} جفت`;

const calculateTotal = (items: any[]) =>
  items.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return total + price * quantity;
  }, 0);

/* ================= ITEM CARD ================= */

const CartItemCard = ({
  item,
  loading,
  onUpdateQuantity,
  onRemove,
}: {
  item: any;
  loading: boolean;
  onUpdateQuantity: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
}) => {
  const quantityIncrement = 10;
  const itemPrice = Number(item.price) || 0;
  const itemQuantity = Number(item.quantity) || 0;
  const itemTotal = itemPrice * itemQuantity;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <div className="mb-4 flex gap-4">
        <Image
          src={item.image || "/images/default-shoe.png"}
          alt={item.name}
          width={80}
          height={80}
          className="rounded-xl object-cover"
        />

        <div className="flex-1">
          <h3 className="truncate text-sm font-bold">{item.name}</h3>
          {item.brand && (
            <p className="mt-1 text-xs text-gray-500">برند: {item.brand}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            قیمت واحد: {itemPrice.toLocaleString()} تومان
          </p>
        </div>

        <div className="text-right">
          <p className="font-bold">{itemTotal.toLocaleString()} تومان</p>
          <p className="text-xs text-gray-500">
            {formatQuantity(itemQuantity)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-2">
          <button
            disabled={loading || itemQuantity <= quantityIncrement}
            onClick={() =>
              onUpdateQuantity(
                item.id,
                Math.max(0, itemQuantity - quantityIncrement),
              )
            }
            className="h-8 w-8 rounded bg-gray-100 disabled:opacity-50"
          >
            −
          </button>
          <span className="font-bold">
            {Math.ceil(itemQuantity / quantityIncrement)}
          </span>
          <button
            disabled={loading}
            onClick={() =>
              onUpdateQuantity(item.id, itemQuantity + quantityIncrement)
            }
            className="h-8 w-8 rounded bg-gray-100 disabled:opacity-50"
          >
            +
          </button>
        </div>

        <button
          disabled={loading}
          onClick={() => onRemove(item.id)}
          className="text-red-500"
        >
          حذف
        </button>
      </div>
    </div>
  );
};

/* ================= PAGE ================= */

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

  const handleRemove = (itemId: number) => {
    showToast({
      type: "warning",
      message: "آیا از حذف این محصول مطمئن هستید؟",
      action: async () => {
        await removeItem(itemId);
      },
      actionLabel: "حذف",
      cancelLabel: "لغو",
    });
  };

  const handleUpdateQuantity = async (itemId: number, qty: number) => {
    if (qty <= 0) return handleRemove(itemId);
    await updateItemQuantity(itemId, qty);
  };

  const handleConfirmOrder = async (customer: {
    name: string;
    phone: string;
  }) => {
    const success = await checkout(customer);
    if (success) {
      setModalOpen(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">سبد خرید خالی است</h1>
          <Link
            href="/products"
            className="rounded-full bg-cyan-500 px-6 py-3 text-white"
          >
            مشاهده محصولات
          </Link>
        </div>
      </div>
    );
  }

  const total = calculateTotal(cartItems);
  const discount = 2500;
  const tax = 2000;
  const telegramDiscount = telegramUser ? 1000 : 0;
  const finalAmount = total - discount - telegramDiscount + tax;

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

        <div className="rounded-2xl bg-white p-6 dark:bg-gray-800">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>مبلغ کل</span>
              <span>{total.toLocaleString()} تومان</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>تخفیف</span>
              <span>-{discount.toLocaleString()}</span>
            </div>
            {telegramUser && (
              <div className="flex justify-between text-green-600">
                <span>تخفیف تلگرام</span>
                <span>-{telegramDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>مالیات و حمل</span>
              <span>+{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>قابل پرداخت</span>
              <span>{finalAmount.toLocaleString()} تومان</span>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Link
              href="/products"
              className="flex-1 rounded-full border py-3 text-center"
            >
              خرید بیشتر
            </Link>
            <button
              disabled={loading}
              onClick={() => setModalOpen(true)}
              className="flex-1 rounded-full bg-cyan-500 py-3 text-white disabled:opacity-50"
            >
              تکمیل سفارش
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
