"use client";

import { useState } from "react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { name: string; phone: string }) => void;
}

const CheckoutModal = ({ isOpen, onClose, onConfirm }: CheckoutModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

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

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          اطلاعات سفارش‌دهنده
        </h2>

        {error && (
          <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <input
          type="text"
          placeholder="نام و نام خانوادگی"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3 w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
        />
        <input
          type="text"
          placeholder="شماره تماس"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mb-3 w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
          >
            لغو
          </button>
          <button
            onClick={handleConfirm}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            disabled={!name.trim() || !phone.trim()}
          >
            ثبت سفارش
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
