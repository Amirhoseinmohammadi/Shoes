"use client";

import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import Image from "next/image";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { name: string; phone: string }) => void;
  telegramUser?: {
    first_name?: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  } | null;
}

const CheckoutModal = ({
  isOpen,
  onClose,
  onConfirm,
  telegramUser,
}: CheckoutModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isTelegram } = useTelegram();

  useEffect(() => {
    if (telegramUser && isOpen) {
      const fullName =
        `${telegramUser.first_name || ""} ${telegramUser.last_name || ""}`.trim();
      if (fullName) {
        setName(fullName);
      }
    }
  }, [telegramUser, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!name.trim()) {
      setError("نام و نام خانوادگی الزامی است");
      return;
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      setError("شماره تماس معتبر نیست (10 تا 15 رقم)");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onConfirm({ name, phone });
      setName("");
      setPhone("");
    } catch (err) {
      setError("خطایی در ثبت سفارش رخ داد");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setName("");
    setPhone("");
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && name.trim() && phone.trim()) {
      handleConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-hidden overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 p-6 text-white">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">تأیید سفارش</h2>
            <button
              onClick={handleClose}
              className="rounded-full p-2 transition hover:bg-white/20"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {telegramUser && isTelegram && (
            <div className="flex items-center gap-3 rounded-xl bg-white/20 p-3 backdrop-blur-sm">
              {telegramUser.photo_url ? (
                <Image
                  src={telegramUser.photo_url}
                  alt={telegramUser.first_name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full border-2 border-white/50 object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/50 bg-white/20 text-sm font-bold">
                  {telegramUser.first_name?.charAt(0)}
                </div>
              )}
              <div className="text-sm">
                <p className="font-semibold">{telegramUser.first_name}</p>
                {telegramUser.username && (
                  <p className="text-xs text-cyan-100">
                    @{telegramUser.username}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4 p-6">
          {/* Telegram Info */}
          {telegramUser && isTelegram && (
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 text-lg">✓</span>
                <div className="text-sm">
                  <p className="font-semibold text-cyan-900">
                    کاربر تلگرام تأیید شده
                  </p>
                  <p className="mt-1 text-xs text-cyan-700">
                    شما از تخفیف ویژه بهره‌مند می‌شوید
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4">
              <span className="flex-shrink-0 text-lg">⚠️</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                نام و نام خانوادگی
              </label>
              <input
                type="text"
                placeholder="نام خود را وارد کنید"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-200 focus:outline-none"
              />
            </div>

            {/* Phone Input */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                شماره تماس
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm text-gray-500">
                  🇮🇷
                </span>
                <input
                  type="tel"
                  placeholder="09xxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  onKeyPress={handleKeyPress}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-gray-900 placeholder-gray-400 transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-200 focus:outline-none"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                شماره باید 10 تا 15 رقم باشد
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="space-y-2 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex gap-2 text-sm text-blue-900">
              <span>ℹ️</span>
              <p>بعد از ثبت سفارش، یک کد تراکنش دریافت خواهید کرد</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-3 border-t border-gray-200 bg-gray-50 p-6">
          <button
            onClick={handleConfirm}
            disabled={!name.trim() || !phone.trim() || loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3.5 font-bold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                در حال پردازش...
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
            onClick={handleClose}
            disabled={loading}
            className="w-full rounded-xl border-2 border-gray-300 bg-white py-3 font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
