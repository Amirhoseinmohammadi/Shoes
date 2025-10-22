"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { apiClient } from "@/lib/api-client";

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface UseTelegramReturn {
  user: TelegramUser | null;
  loading: boolean;
  error: string | null;
  isTelegram: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  session: any;
  sendData: (data: any) => void;
  closeApp: () => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string) => Promise<boolean>;
  checkAdminAccess: () => boolean;
  debug: {
    adminId: number;
    isTelegram: boolean;
    userLoaded: boolean;
    sessionStatus: string;
  };
}

export function useTelegram(): UseTelegramReturn {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramEnv, setIsTelegramEnv] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const ADMIN_USER_ID = useMemo(
    () =>
      process.env.NEXT_PUBLIC_ADMIN_USER_ID
        ? parseInt(process.env.NEXT_PUBLIC_ADMIN_USER_ID)
        : 697803275,
    [],
  );

  // Initialize Telegram WebApp
  const initializeTelegram = useCallback(async () => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      console.warn("❌ محیط تلگرام یافت نشد");
      setIsTelegramEnv(false);
      if (pathname?.startsWith("/admin")) router.push("/access-denied");
      setLoading(false);
      return;
    }

    try {
      tg.ready();
      tg.expand();
      setIsTelegramEnv(true);

      const userData: TelegramUser | undefined = tg.initDataUnsafe?.user;

      if (userData) {
        setUser(userData);
        await loginToNextAuth(userData, tg.initData);
      } else if (tg.initData) {
        const response = await apiClient.telegram.validateInit(tg.initData);
        if (response.valid && response.payload?.user) {
          setUser(response.payload.user);
          await loginToNextAuth(response.payload.user, tg.initData);
        } else {
          console.error("❌ initData نامعتبر");
          if (pathname?.startsWith("/admin")) router.push("/access-denied");
        }
      } else {
        console.error("❌ هیچ داده‌ای از تلگرام دریافت نشد");
        if (pathname?.startsWith("/admin")) router.push("/access-denied");
      }
    } catch (err) {
      console.error("خطا در احراز هویت تلگرام:", err);
      setError("خطا در احراز هویت تلگرام");
      if (pathname?.startsWith("/admin")) router.push("/access-denied");
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  // Login to NextAuth
  const loginToNextAuth = useCallback(
    async (userData: TelegramUser, initData: string) => {
      try {
        const params = new URLSearchParams(initData);
        const authDate = params.get("auth_date") || "";
        const hash = params.get("hash") || "";

        const result = await signIn("telegram", {
          redirect: false,
          id: userData.id.toString(),
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          username: userData.username || "",
          auth_date: authDate,
          hash: hash,
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
    },
    [],
  );

  const checkAdminAccess = useCallback(
    (userId: number): boolean => {
      if (userId !== ADMIN_USER_ID) {
        console.warn("🚫 دسترسی غیرمجاز - کاربر ID:", userId);
        router.push("/access-denied");
        return false;
      }
      return true;
    },
    [ADMIN_USER_ID, router],
  );

  useEffect(() => {
    initializeTelegram();
  }, [initializeTelegram]);

  useEffect(() => {
    if (user && pathname?.startsWith("/admin")) {
      checkAdminAccess(user.id);
    }
  }, [user, pathname, checkAdminAccess]);

  const sendData = useCallback((data: any) => {
    if (typeof window === "undefined") return;
    const tg = (window as any).Telegram?.WebApp;
    tg?.sendData(JSON.stringify(data));
  }, []);

  const closeApp = useCallback(() => {
    if (typeof window === "undefined") return;
    const tg = (window as any).Telegram?.WebApp;
    tg?.close();
  }, []);

  const showAlert = useCallback((message: string) => {
    if (typeof window === "undefined") return;
    const tg = (window as any).Telegram?.WebApp;
    tg?.showAlert(message) ?? alert(message);
  }, []);

  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.showConfirm) {
        tg.showConfirm(message, (confirmed: boolean) => resolve(confirmed));
      } else {
        resolve(confirm(message));
      }
    });
  }, []);

  const isAdmin = useMemo(
    () => user?.id === ADMIN_USER_ID,
    [user, ADMIN_USER_ID],
  );

  return {
    user,
    loading: loading || status === "loading",
    error,
    isTelegram: isTelegramEnv,
    isAdmin,
    isAuthenticated: status === "authenticated",
    session,
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
