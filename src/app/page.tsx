"use client";

import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";
import {
  TelegramStatus,
  WelcomeToast,
  HomeLoadingSkeleton,
} from "@/components/Home";
import LoadingSkeleton from "@/components/Common/LoadingSkeleton";

const Hero = dynamic(() => import("@/components/Hero"), {
  loading: () => (
    <div className="h-96 w-full animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
  ),
  ssr: true,
});

const Products = dynamic(() => import("@/components/Products"), {
  loading: () => (
    <div className="container mx-auto px-4 py-12">
      <LoadingSkeleton type="productGrid" count={8} />
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

export default function Home() {
  const { user, loading, isTelegram } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && user?.id && mounted) {
      const welcomeKey = `welcomeShown_user_${user.id}`;

      if (typeof window !== "undefined" && !localStorage.getItem(welcomeKey)) {
        const showTimer = setTimeout(() => {
          setShowWelcome(true);
          localStorage.setItem(welcomeKey, "true");
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
  }, [user?.id, loading, mounted]);

  if (!mounted) {
    return <HomeLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900 transition-colors">
      <div
        className="fixed top-4 right-4 z-50"
        role="region"
        aria-label="theme switcher"
      >
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
          <div className="h-96 w-full animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
        }
      >
        <Hero />
      </Suspense>

      <TelegramStatus isTelegram={isTelegram} loading={loading} user={user} />

      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-12">
            <LoadingSkeleton type="productGrid" count={8} />
          </div>
        }
      >
        <Products telegramUser={user} />
      </Suspense>

      <WelcomeToast show={showWelcome} userName={user?.first_name} />
    </div>
  );
}
