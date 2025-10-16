"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiClient } from "@/lib/api-client";

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID
    ? parseInt(process.env.NEXT_PUBLIC_ADMIN_USER_ID)
    : 697803275;

  useEffect(() => {
    initializeTelegram();
  }, [pathname]);

  const initializeTelegram = async () => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      console.log("❌ محیط تلگرام یافت نشد");
      handleNonTelegramAccess();
      setLoading(false);
      return;
    }

    try {
      tg.ready();
      tg.expand();

      // اول از initDataUnsafe استفاده کن (سریع‌تر)
      const userData = tg.initDataUnsafe?.user;

      if (userData) {
        setUser(userData);
        checkAdminAccess(userData.id);
      } else {
        // اگر initDataUnsafe نداشت، از initData استفاده کن
        const initData = tg.initData;
        if (initData) {
          const response = await apiClient.telegram.validateInit(initData);
          if (response.valid && response.payload?.user) {
            setUser(response.payload.user);
            checkAdminAccess(response.payload.user.id);
          } else {
            handleInvalidUser();
          }
        } else {
          handleInvalidUser();
        }
      }
    } catch (err) {
      console.error("خطا در احراز هویت تلگرام:", err);
      setError("Failed to initialize Telegram");
      handleInvalidUser();
    } finally {
      setLoading(false);
    }
  };

  const checkAdminAccess = (userId: number) => {
    const isAdminPath = pathname?.startsWith("/admin");
    if (isAdminPath && userId !== ADMIN_USER_ID) {
      console.log("🚫 دسترسی غیرمجاز - کاربر ID:", userId);
      router.push("/access-denied");
    }
  };

  const handleNonTelegramAccess = () => {
    if (pathname?.startsWith("/admin")) {
      router.push("/access-denied");
    }
  };

  const handleInvalidUser = () => {
    if (pathname?.startsWith("/admin")) {
      router.push("/access-denied");
    }
  };

  const isAdmin = user?.id === ADMIN_USER_ID;

  // متدهای utility برای تلگرام
  const sendData = (data: any) => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.sendData(JSON.stringify(data));
    }
  };

  const closeApp = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.close();
    }
  };

  const showAlert = (message: string) => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.showAlert(message);
    }
  };

  return {
    // داده‌ها
    user,
    loading,
    error,

    // وضعیت‌ها
    isTelegram: !!(window as any).Telegram?.WebApp,
    isAdmin,

    // متدها
    sendData,
    closeApp,
    showAlert,
    checkAdminAccess: () => {
      if (isAdmin) return true;
      if (pathname?.startsWith("/admin")) {
        router.push("/access-denied");
      }
      return false;
    },
  };
}
