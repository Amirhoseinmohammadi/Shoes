"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { useTelegram } from "@/hooks/useTelegram";

const Hero = dynamic(() => import("@/components/Hero"), {
  loading: () => (
    <div className="h-96 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
  ),
  ssr: true,
});

const Products = dynamic(() => import("@/components/Products"), {
  loading: () => (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    </div>
  ),
  ssr: true,
});

const ThemeToggler = dynamic(() => import("@/components/Header/ThemeToggler"), {
  loading: () => (
    <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
  ),
  ssr: false,
});

const TelegramStatus = ({
  isTelegram,
  loading,
  telegramUser,
}: {
  isTelegram: boolean;
  loading: boolean;
  telegramUser: any;
}) => {
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

const WelcomeToast = ({
  show,
  userName,
}: {
  show: boolean;
  userName?: string;
}) => {
  if (!show) return null;

  return (
    <div className="animate-fade-in fixed bottom-24 left-1/2 z-50 -translate-x-1/2 transform rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 text-white shadow-2xl">
      <div className="flex items-center gap-3">
        <span className="text-2xl">👋</span>
        <div>
          <p className="font-bold">خوش آمدید {userName || "کاربر"}!</p>
          <p className="text-sm opacity-90">به فروشگاه ما خوش آمدید</p>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { user: telegramUser, loading, isTelegram } = useTelegram();
  const [showWelcome, setShowWelcome] = useState(false);
  const [mounted, setMounted] = useState(false);

  const hasShownWelcome = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && telegramUser?.id && mounted) {
      if (!hasShownWelcome.current) {
        console.log("🎉 نمایش پیام خوش آمدگویی");

        const showTimer = setTimeout(() => {
          setShowWelcome(true);
          hasShownWelcome.current = true;
        }, 500);

        const hideTimer = setTimeout(() => {
          setShowWelcome(false);
        }, 5500);

        return () => {
          clearTimeout(showTimer);
          clearTimeout(hideTimer);
        };
      }
    }
  }, [telegramUser?.id, loading, mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="fixed top-4 right-4 z-50 h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-screen animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="fixed top-4 right-4 z-50">
        <Suspense
          fallback={
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          }
        >
          <ThemeToggler />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <div className="h-96 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
        }
      >
        <Hero />
      </Suspense>

      <TelegramStatus
        isTelegram={isTelegram}
        loading={loading}
        telegramUser={telegramUser}
      />

      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700"
                />
              ))}
            </div>
          </div>
        }
      >
        {!loading && <Products telegramUser={telegramUser} />}
      </Suspense>

      <WelcomeToast show={showWelcome} userName={telegramUser?.first_name} />
    </div>
  );
}
