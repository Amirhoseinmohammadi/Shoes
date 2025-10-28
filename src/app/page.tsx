"use client";

import Products from "@/components/Products";
import Hero from "@/components/Hero";
import ThemeToggler from "@/components/Header/ThemeToggler";
import { useTelegram } from "@/hooks/useTelegram";
import { useSession, signIn } from "next-auth/react";
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

  // 1️⃣ login خودکار به next-auth وقتی کاربر تلگرام شناسایی شد
  useEffect(() => {
    if (telegramUser && !telegramLoading && !session?.user) {
      signIn("telegram", {
        id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        photo_url: telegramUser.photo_url,
        redirect: false, // بدون ریدایرکت
      });
    }
  }, [telegramUser, telegramLoading, session]);

  // 2️⃣ نمایش پیام خوش‌آمدگویی
  useEffect(() => {
    if (!isLoading && (telegramUser || session?.user)) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [telegramUser, session, isLoading]);

  // 3️⃣ کامپوننت وضعیت تلگرام
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

    if (!telegramUser && !session?.user) {
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

  // 4️⃣ بخش محصولات
  const ProductsSection = () => {
    if (isLoading) return null;

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
          {telegramUser?.first_name || session?.user?.firstName || "کاربر"}!
        </div>
      )}
    </div>
  );
}
