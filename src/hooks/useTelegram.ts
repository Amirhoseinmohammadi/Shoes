"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
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

  // ✅ استفاده از NextAuth session
  const { data: session, status } = useSession();

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

        await loginToNextAuth(userData, tg.initData);
      } else {
        const initData = tg.initData;
        if (initData) {
          console.log("🔄 در حال اعتبارسنجی initData...");
          const response = await apiClient.telegram.validateInit(initData);
          if (response.valid && response.payload?.user) {
            console.log("✅ کاربر از initData:", response.payload.user);
            setUser(response.payload.user);

            await loginToNextAuth(response.payload.user, initData);
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

  const loginToNextAuth = async (userData: TelegramUser, initData: string) => {
    try {
      const params = new URLSearchParams(initData);
      const authDate = params.get("auth_date");
      const hash = params.get("hash");

      const result = await signIn("telegram", {
        redirect: false,
        id: userData.id.toString(),
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        username: userData.username || "",
        auth_date: authDate || "",
        hash: hash || "",
      });

      if (result?.error) {
        console.error("❌ خطا در لاگین NextAuth:", result.error);
        setError("خطا در احراز هویت");
      } else {
        console.log("✅ لاگین NextAuth موفق");
      }
    } catch (err) {
      console.error("❌ خطا در loginToNextAuth:", err);
      setError("خطا در احراز هویت");
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
    loading: loading || status === "loading",
    error,

    isTelegram: isTelegramEnv,
    isAdmin,

    session,
    isAuthenticated: status === "authenticated",

    sendData,
    closeApp,
    showAlert,
    showConfirm,
    checkAdminAccess: () => (user ? checkAdminAccess(user.id) : false),

    debug: {
      adminId: ADMIN_USER_ID,
      isTelegram: isTelegramEnv,
      userLoaded: !!user,
      sessionStatus: status,
    },
  };
}
