"use client";

import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { name: string; phone: string }) => void;
  telegramUser?: {
    first_name?: string;
    last_name?: string;
    username?: string;
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
  const { isTelegram } = useTelegram();

  // پر کردن خودکار اطلاعات از کاربر تلگرام
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

  const handleConfirm = () => {
    if (!name.trim()) {
      setError("نام و نام خانوادگی الزامی است");
      return;
    }

    const phoneRegex = /^[0-9]{10,15}$/; // شماره 10 تا 15 رقمی
    if (!phoneRegex.test(phone)) {
      setError("شماره تماس معتبر نیست");
      return;
    }

    setError("");
    onConfirm({ name, phone });
    setName("");
    setPhone("");
  };

  const handleClose = () => {
    setError("");
    setName("");
    setPhone("");
    onClose();
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            اطلاعات سفارش‌دهنده
          </h2>
          {isTelegram && (
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              📱 تلگرام
            </span>
          )}
        </div>

        {telegramUser && (
          <div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>کاربر تلگرام:</strong> {telegramUser.first_name}
              {telegramUser.username && ` (@${telegramUser.username})`}
            </p>
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              اطلاعات شما از تلگرام دریافت شده است
            </p>
          </div>
        )}

        {error && (
          <div className="mb-3 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              نام و نام خانوادگی *
            </label>
            <input
              type="text"
              placeholder="نام و نام خانوادگی خود را وارد کنید"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              شماره تماس *
            </label>
            <input
              type="tel"
              placeholder="09xxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              شماره تماس باید 10 تا 15 رقم باشد
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="rounded-lg bg-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
          >
            لغو
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
            disabled={!name.trim() || !phone.trim()}
          >
            {isTelegram ? "📱 ثبت از تلگرام" : "ثبت سفارش"}
          </button>
        </div>

        {isTelegram && (
          <div className="mt-4 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
            <p className="text-xs text-green-700 dark:text-green-300">
              💚 شما از تخفیف ویژه کاربران تلگرام بهره‌مند شده‌اید
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
