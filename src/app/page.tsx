"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import Products from "@/components/Products";
import ThemeToggler from "@/components/Header/ThemeToggler";
import { useTelegram } from "@/hooks/useTelegram";

export default function Home() {
  const { user: telegramUser, loading, isTelegram } = useTelegram();
  const [showWelcome, setShowWelcome] = useState(false);

  // ✅ FIXED: Only show welcome when user is fully loaded
  useEffect(() => {
    if (!loading && telegramUser && telegramUser.id) {
      console.log("🎉 نمایش پیام خوش آمدگویی");
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [telegramUser?.id, loading]); // ✅ Use telegramUser?.id as dependency

  const TelegramStatus = () => {
    if (!isTelegram) {
      return (
        <div className="container mx-auto mb-6 px-4">
          <div className="rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 p-4 text-center text-white shadow-lg">
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">
                لطفاً برنامه را از طریق تلگرام باز کنید.
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="container mx-auto mb-6 px-4">
          <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-center text-white shadow-lg">
            <div className="flex items-center justify-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span className="font-medium">در حال اتصال به تلگرام...</span>
            </div>
          </div>
        </div>
      );
    }

    if (!telegramUser) {
      return (
        <div className="container mx-auto mb-6 px-4">
          <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-center text-white shadow-lg">
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">کاربر تلگرام شناسایی نشد</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const ProductsSection = () => {
    if (loading) {
      return (
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            در حال بارگذاری...
          </p>
        </div>
      );
    }

    return <Products telegramUser={telegramUser} />;
  };

  return (
    <div className="min-h-screen">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggler />
      </div>

      <Hero />
      <TelegramStatus />
      <ProductsSection />

      {showWelcome && telegramUser && (
        <div className="animate-fade-in fixed bottom-24 left-1/2 z-50 -translate-x-1/2 transform rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 text-white shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👋</span>
            <div>
              <p className="font-bold">
                خوش آمدید {telegramUser.first_name || "کاربر"}!
              </p>
              <p className="text-sm opacity-90">به فروشگاه ما خوش آمدید</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
