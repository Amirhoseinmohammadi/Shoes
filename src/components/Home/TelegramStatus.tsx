import React from "react";
import { AuthUser } from "@/types/auth";

interface TelegramStatusProps {
  isTelegram: boolean;
  loading: boolean;
  user: AuthUser | null;
}

export default function TelegramStatus({
  isTelegram,
  loading,
  user,
}: TelegramStatusProps) {
  if (!isTelegram) {
    return (
      <div className="container mx-auto mb-6 px-4">
        <div className="rounded-2xl bg-gradient-to-r from-gray-700 to-gray-800 p-4 text-center text-white shadow-lg border border-gray-600/30">
          <div className="flex items-center justify-center gap-3">
            <span className="text-xl" aria-label="warning">
              ⚠️
            </span>
            <span className="font-medium text-sm md:text-base">
              لطفاً برنامه را از طریق تلگرام باز کنید یا وارد حساب خود شوید.
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto mb-6 px-4">
        <div className="rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 p-4 text-center text-white shadow-lg">
          <div className="flex items-center justify-center gap-3">
            <div
              className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              role="status"
              aria-label="loading"
            />
            <span className="font-medium text-sm md:text-base">
              در حال اتصال به تلگرام...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto mb-6 px-4">
        <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-center text-white shadow-lg">
          <div className="flex items-center justify-center gap-3">
            <span className="text-xl" aria-label="warning">
              ⚠️
            </span>
            <span className="font-medium text-sm md:text-base">
              کاربر تلگرام شناسایی نشد
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
