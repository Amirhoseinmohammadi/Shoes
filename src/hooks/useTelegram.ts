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
  const [isTelegramEnv, setIsTelegramEnv] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID
    ? parseInt(process.env.NEXT_PUBLIC_ADMIN_USER_ID)
    : 697803275;

  useEffect(() => {
    initializeTelegram();
  }, []);

  useEffect(() => {
    if (user && pathname?.startsWith("/admin")) {
      checkAdminAccess(user.id);
    }
  }, [user, pathname]);

  const initializeTelegram = async () => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      console.log("❌ محیط تلگرام یافت نشد");
      setIsTelegramEnv(false);
      handleNonTelegramAccess();
      setLoading(false);
      return;
    }

    try {
      tg.ready();
      tg.expand();
      setIsTelegramEnv(true);

      const userData = tg.initDataUnsafe?.user;

      if (userData) {
        console.log("✅ کاربر از initDataUnsafe:", userData);
        setUser(userData);
      } else {
        const initData = tg.initData;
        if (initData) {
          console.log("🔄 در حال اعتبارسنجی initData...");
          const response = await apiClient.telegram.validateInit(initData);
          if (response.valid && response.payload?.user) {
            console.log("✅ کاربر از initData:", response.payload.user);
            setUser(response.payload.user);
          } else {
            console.log("❌ initData نامعتبر");
            handleInvalidUser();
          }
        } else {
          console.log("❌ هیچ داده‌ای از تلگرام دریافت نشد");
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
    if (userId !== ADMIN_USER_ID) {
      console.log("🚫 دسترسی غیرمجاز - کاربر ID:", userId);
      router.push("/access-denied");
      return false;
    }
    return true;
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

  const sendData = (data: any) => {
    if (typeof window === "undefined") return;
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.sendData(JSON.stringify(data));
    }
  };

  const closeApp = () => {
    if (typeof window === "undefined") return;
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.close();
    }
  };

  const showAlert = (message: string) => {
    if (typeof window === "undefined") return;
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.showAlert(message);
    } else {
      alert(message);
    }
  };

  const showConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }

      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.showConfirm) {
        tg.showConfirm(message, (confirmed: boolean) => {
          resolve(confirmed);
        });
      } else {
        resolve(confirm(message));
      }
    });
  };

  return {
    user,
    loading,
    error,

    isTelegram: isTelegramEnv,
    isAdmin,

    sendData,
    closeApp,
    showAlert,
    showConfirm,
    checkAdminAccess: () => (user ? checkAdminAccess(user.id) : false),

    debug: {
      adminId: ADMIN_USER_ID,
      isTelegram: isTelegramEnv,
      userLoaded: !!user,
    },
  };
}
