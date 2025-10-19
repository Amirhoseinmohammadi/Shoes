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

const CheckoutModal = ({
  isOpen,
  onClose,
  onConfirm,
  cartItems = [],
  totalPrice = 0,
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

    if (cartItems.length === 0) {
      setError("سبد خرید شما خالی است");
      return;
    }

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

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || result.message || "خطا در ثبت سفارش");
      }

      onConfirm({
        name,
        phone,
        orderId: result.orderId,
        trackingCode: result.trackingCode,
      });

      setName("");
      setPhone("");
    } catch (err: any) {
      console.error("خطا در ثبت سفارش:", err);
      setError(err.message || "خطایی در ثبت سفارش رخ داد");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError("");
      setName("");
      setPhone("");
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim() && phone.trim() && !loading) {
      handleConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-hidden overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 p-6 text-white">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">تأیید سفارش</h2>
            <button
              onClick={handleClose}
              className="rounded-full p-2 transition hover:bg-white/20"
              disabled={loading}
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
                  alt={telegramUser.first_name || "User"}
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

        <div className="space-y-4 p-6">
          {cartItems.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold text-gray-900">خلاصه سفارش</h3>
              <div className="space-y-2">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
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
              <div className="mt-3 border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>جمع کل:</span>
                  <span>{totalPrice.toLocaleString()} تومان</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-gray-200 bg-gray-50 p-6">
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
