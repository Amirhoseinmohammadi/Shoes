"use client";

import ScrollUp from "@/components/Common/ScrollUp";
import Products from "@/components/Products";
import Hero from "@/components/Hero";
import { useTelegram } from "@/hooks/useTelegram";

export default function Home() {
  const { user: telegramUser, loading, isTelegram } = useTelegram();

  const getWelcomeMessage = () => {
    if (!telegramUser) return null;

    return (
      <div className="bg-gradient-to-r from-green-100 to-blue-100 py-3 text-center">
        <div className="container mx-auto px-4">
          <p className="font-medium text-green-800">
            🎉 خوش اومدی، <strong>{telegramUser.first_name}</strong>!
            {telegramUser.username && ` (@${telegramUser.username})`}
          </p>
          <p className="mt-1 text-sm text-green-600">
            تخفیف ویژه کاربران تلگرام فعال شد! 🏷️
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <ScrollUp />
      <Hero />

      {isTelegram && (
        <>
          {loading && (
            <div className="bg-blue-100 py-3 text-center text-blue-800">
              <div className="container mx-auto px-4">
                🔄 در حال اتصال به تلگرام...
              </div>
            </div>
          )}

          {!loading && getWelcomeMessage()}

          {!loading && !telegramUser && (
            <div className="bg-yellow-100 py-3 text-center text-yellow-800">
              <div className="container mx-auto px-4">
                ⚠️ کاربر تلگرام شناسایی نشد
              </div>
            </div>
          )}
        </>
      )}

      <Products telegramUser={telegramUser} />
    </>
  );
}
