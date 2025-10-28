"use client";

import Products from "@/components/Products";
import Hero from "@/components/Hero";
import ThemeToggler from "@/components/Header/ThemeToggler";
import { useTelegram } from "@/hooks/useTelegram";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Home() {
  const { data: session, status: sessionStatus } = useSession();
  const {
    user: telegramUser,
    loading: telegramLoading,
    isTelegram,
  } = useTelegram();
  const [showWelcome, setShowWelcome] = useState(false);

  const isSessionLoading = sessionStatus === "loading";
  const isLoading = telegramLoading || isSessionLoading;

  // Show welcome message when user is loaded
  useEffect(() => {
    if (!isLoading && (telegramUser || session?.user)) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [telegramUser, session, isLoading]);

  const TelegramStatus = () => {
    if (!isTelegram) return null;

    if (isLoading) {
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
    // فقط زمانی render کن که کاربر load شده باشه
    if (isLoading) return null;

    // پاس دادن telegramUser یا session user
    const user = telegramUser || session?.user || null;

    return <Products telegramUser={user} />;
  };

  return (
    <div className="min-h-screen">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggler />
      </div>

      <Hero />
      <TelegramStatus />
      <ProductsSection />

      {showWelcome && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 transform rounded-2xl bg-green-500 p-4 text-white shadow-lg">
          خوش آمدید{" "}
          {telegramUser?.firstName || session?.user?.firstName || "کاربر"}!
        </div>
      )}
    </div>
  );
}
