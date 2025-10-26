"use client";

import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import Image from "next/image";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    name: string;
    phone: string;
    orderId: number;
    trackingCode: string;
  }) => void;
  cartItems: any[];
  totalPrice: number;
  telegramUser?: {
    first_name?: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    id?: number;
  } | null;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  onConfirm,
  cartItems = [],
  totalPrice = 0,
  telegramUser,
}: CheckoutModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isTelegram } = useTelegram();

  useEffect(() => {
    if (telegramUser && isOpen) {
      const fullName =
        `${telegramUser.first_name || ""} ${telegramUser.last_name || ""}`.trim();
      if (fullName) setName(fullName);
    }
  }, [telegramUser, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    // ✅ اعتبارسنجی
    if (!name.trim()) {
      setError("نام و نام خانوادگی الزامی است");
      return;
    }

    const phoneRegex = /^(\+98|0)?9\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      setError("شماره تماس معتبر نیست (مثال: 09123456789)");
      return;
    }

    if (cartItems.length === 0) {
      setError("سبد خرید شما خالی است");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // ✅ ساخت داده‌های سفارش با فرمت صحیح
      const orderData = {
        customerName: name.trim(),
        customerPhone: phone.replace(/\s/g, "").trim(),
        totalPrice,
        telegramData: telegramUser?.id
          ? {
              telegramId: Number(telegramUser.id), // ✅ مطمئن میشیم Number هست
              firstName: telegramUser.first_name || null,
              lastName: telegramUser.last_name || null,
              username: telegramUser.username || null,
              isTelegramUser: true,
            }
          : null,
        items: cartItems.map((item) => ({
          productId: item.productId || item.id, // ✅ اول productId رو چک میکنیم
          quantity: item.quantity || 1,
          price: item.price,
          color: item.color || null,
          size: item.size || null,
        })),
      };

      console.log("📦 ارسال سفارش:", orderData);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await res.json();

      console.log("📥 پاسخ سرور:", result);

      if (!result.success) {
        throw new Error(result.error || "خطا در ثبت سفارش");
      }

      // ✅ پاک کردن فرم
      setName("");
      setPhone("");

      // ✅ بستن مودال
      onClose();

      // ✅ نمایش پیام موفقیت و رفرش صفحه
      alert(
        `✅ سفارش با موفقیت ثبت شد!\nکد پیگیری: ${result.trackingCode || result.orderId}`,
      );

      // ✅ رفتن به صفحه اصلی
      window.location.href = "/";
    } catch (err: any) {
      console.error("❌ خطا در ثبت سفارش:", err);
      setError(err.message || "خطایی در ثبت سفارش رخ داد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/70"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-hidden rounded-3xl bg-white text-gray-900 shadow-2xl transition dark:bg-[#1e1e1e] dark:text-white"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 p-5 text-white dark:from-cyan-700 dark:to-cyan-500">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold">تأیید سفارش</h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-full p-2 transition hover:bg-white/20 disabled:opacity-50"
            >
              ✕
            </button>
          </div>

          {telegramUser && isTelegram && (
            <div className="flex items-center gap-3 rounded-xl bg-white/20 p-3">
              {telegramUser.photo_url ? (
                <Image
                  src={telegramUser.photo_url}
                  alt="User"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-white/50 object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/50 bg-white/20 text-sm font-bold">
                  {telegramUser.first_name?.charAt(0) || "👤"}
                </div>
              )}
              <div className="text-sm">
                <p className="font-semibold">
                  {telegramUser.first_name} {telegramUser.last_name}
                </p>
                {telegramUser.username && (
                  <p className="text-xs opacity-80">@{telegramUser.username}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-6">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-semibold">
                نام و نام خانوادگی *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً علی رضایی"
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 transition outline-none focus:border-cyan-500 focus:ring focus:ring-cyan-200 disabled:opacity-50 dark:border-gray-700 dark:bg-[#2b2b2b] dark:focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold">
                شماره تماس *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 transition outline-none focus:border-cyan-500 focus:ring focus:ring-cyan-200 disabled:opacity-50 dark:border-gray-700 dark:bg-[#2b2b2b] dark:focus:border-cyan-400"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {cartItems.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-[#2b2b2b]">
              <h3 className="mb-3 font-semibold">خلاصه سفارش</h3>
              <div className="space-y-2 text-sm">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>
                      {item.name} × {item.quantity || 1}
                    </span>
                    <span>
                      {(
                        (item.price || 0) * (item.quantity || 1)
                      ).toLocaleString()}{" "}
                      تومان
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between border-t pt-2 font-semibold dark:border-gray-700">
                <span>جمع کل:</span>
                <span className="text-cyan-600 dark:text-cyan-400">
                  {totalPrice.toLocaleString()} تومان
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="space-y-3 border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-[#1c1c1c]">
          <button
            onClick={handleConfirm}
            disabled={
              !name.trim() || !phone.trim() || loading || cartItems.length === 0
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3.5 font-bold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                در حال ثبت سفارش...
              </>
            ) : (
              <>
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                تأیید و ثبت سفارش
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full rounded-xl border-2 border-gray-300 bg-white py-3 font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-700"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
