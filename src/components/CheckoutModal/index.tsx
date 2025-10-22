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
  const { isTelegram, theme } = useTelegram();

  const isDark = theme?.startsWith("dark");

  useEffect(() => {
    if (telegramUser && isOpen) {
      const fullName =
        `${telegramUser.first_name || ""} ${telegramUser.last_name || ""}`.trim();
      if (fullName) setName(fullName);
    }
  }, [telegramUser, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!name.trim()) return setError("نام و نام خانوادگی الزامی است");
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) return setError("شماره تماس معتبر نیست");
    if (cartItems.length === 0) return setError("سبد خرید شما خالی است");

    setError("");
    setLoading(true);
    try {
      const orderData = {
        customerName: name.trim(),
        customerPhone: phone.trim(),
        totalPrice,
        telegramData: telegramUser
          ? {
              telegramId: telegramUser.id,
              firstName: telegramUser.first_name,
              lastName: telegramUser.last_name,
              username: telegramUser.username,
              isTelegramUser: true,
            }
          : null,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity || 1,
          price: item.price,
          color: item.color || null,
          size: item.size || null,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error || "خطا در ثبت سفارش");

      onConfirm({
        name,
        phone,
        orderId: result.orderId,
        trackingCode: result.trackingCode,
      });

      setName("");
      setPhone("");
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
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${
        isDark ? "bg-black/70" : "bg-black/40"
      }`}
    >
      <div
        className={`max-h-[90vh] w-full max-w-md overflow-hidden rounded-3xl shadow-2xl transition ${
          isDark ? "bg-[#1e1e1e] text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 ${
            isDark
              ? "bg-gradient-to-r from-cyan-700 to-cyan-500"
              : "bg-gradient-to-r from-cyan-400 to-cyan-500 text-white"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold">تأیید سفارش</h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-full p-2 transition hover:bg-white/20"
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
                  {telegramUser.first_name?.charAt(0)}
                </div>
              )}
              <div className="text-sm">
                <p className="font-semibold">{telegramUser.first_name}</p>
                {telegramUser.username && (
                  <p className="text-xs opacity-80">@{telegramUser.username}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-semibold">
                نام و نام خانوادگی
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً علی رضایی"
                className={`w-full rounded-xl px-4 py-2 outline-none ${
                  isDark
                    ? "border border-gray-700 bg-[#2b2b2b] focus:border-cyan-400"
                    : "border border-gray-300 bg-white focus:border-cyan-500 focus:ring focus:ring-cyan-200"
                }`}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold">
                شماره تماس
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثلاً 09123456789"
                className={`w-full rounded-xl px-4 py-2 outline-none ${
                  isDark
                    ? "border border-gray-700 bg-[#2b2b2b] focus:border-cyan-400"
                    : "border border-gray-300 bg-white focus:border-cyan-500 focus:ring focus:ring-cyan-200"
                }`}
              />
            </div>

            {error && (
              <p className="mt-1 text-sm font-semibold text-red-500">{error}</p>
            )}
          </div>

          {/* Cart Summary */}
          {cartItems.length > 0 && (
            <div
              className={`rounded-2xl border p-4 ${
                isDark
                  ? "border-gray-700 bg-[#2b2b2b]"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
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
              <div className="mt-3 flex justify-between border-t pt-2 font-semibold">
                <span>جمع کل:</span>
                <span>{totalPrice.toLocaleString()} تومان</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`space-y-3 border-t p-6 ${
            isDark
              ? "border-gray-700 bg-[#1c1c1c]"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <button
            onClick={handleConfirm}
            disabled={
              !name.trim() || !phone.trim() || loading || cartItems.length === 0
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3.5 font-bold text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
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
            className={`w-full rounded-xl border-2 py-3 font-bold transition ${
              isDark
                ? "border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
