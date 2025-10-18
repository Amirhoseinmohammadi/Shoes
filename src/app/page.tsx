"use client";

import Products from "@/components/Products";
import Hero from "@/components/Hero";
import { useTelegram } from "@/hooks/useTelegram";
import { useState, useEffect } from "react";

export default function Home() {
  const { user: telegramUser, loading, isTelegram } = useTelegram();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (telegramUser && !loading) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [telegramUser, loading]);

  const TelegramStatus = () => {
    if (!isTelegram) return null;

    return (
      <div className="container mx-auto mb-6 px-4">
        {loading && (
          <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-center text-white shadow-lg">
            <div className="flex items-center justify-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span className="font-medium">در حال اتصال به تلگرام...</span>
            </div>
          </div>
        )}

        {!loading && !telegramUser && (
          <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-center text-white shadow-lg">
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">کاربر تلگرام شناسایی نشد</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ProductsSection = () => (
    <div className="">
      <Products telegramUser={telegramUser} />
    </div>
  );

  return (
    <div className="min-h-screen">
      <Hero />

      <TelegramStatus />

      <ProductsSection />
    </div>
  );
}
