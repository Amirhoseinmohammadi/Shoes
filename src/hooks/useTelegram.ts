"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface UseTelegramReturn {
  user: TelegramUser | null;
  loading: boolean;
  error: string | null;
  isTelegram: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  session: any;
  theme: string;
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
  const [theme, setTheme] = useState<string>("light");

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

  const initializeTelegram = useCallback(async () => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      console.warn("❌ محیط تلگرام یافت نشد - حالت عادی");
      setIsTelegramEnv(false);
      setLoading(false);
      return;
    }

    try {
      console.log("🚀 شروع initialize تلگرام");

      tg.ready();
      tg.expand();
      setIsTelegramEnv(true);

      const telegramTheme = tg.colorScheme || "light";
      setTheme(telegramTheme);

      const userData: TelegramUser | undefined = tg.initDataUnsafe?.user;

      if (!userData?.id) {
        console.error("❌ اطلاعات کاربر تلگرام موجود نیست");
        setError("اطلاعات کاربر تلگرام موجود نیست");
        setLoading(false);
        return;
      }

      console.log("✅ اطلاعات کاربر تلگرام:", {
        id: userData.id,
        username: userData.username,
        first_name: userData.first_name,
      });

      setUser(userData);
      await loginToNextAuth(userData);
    } catch (err: any) {
      console.error("❌ خطا در initialize تلگرام:", err);
      setError("خطا در احراز هویت تلگرام");
    } finally {
      setLoading(false);
    }
  }, []);

  const loginToNextAuth = useCallback(async (userData: TelegramUser) => {
    try {
      console.log("🔐 شروع لاگین NextAuth با داده‌های:", {
        id: userData.id,
        username: userData.username,
        first_name: userData.first_name,
      });

      const result = await signIn("telegram", {
        redirect: false,
        id: userData.id.toString(),
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        username: userData.username || "",
        auth_date: Date.now().toString(),
        hash: "dummy",
      });

      console.log("📥 نتیجه signIn:", result);

      if (result?.error) {
        console.error("❌ خطا در لاگین NextAuth:", result.error);
        setError(`خطا در احراز هویت: ${result.error}`);
      } else if (result?.ok) {
        console.log("✅ لاگین NextAuth موفق بود");

        setTimeout(() => {
          console.log("🔄 رفرش صفحه برای اعمال session");
          window.location.reload();
        }, 500);
      }
    } catch (err: any) {
      console.error("❌ خطا در loginToNextAuth:", err);
      setError("خطا در احراز هویت");
    }
  }, []);

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
    console.log("📊 Session status:", status);
    console.log("👤 Session data:", session);
  }, [status, session]);

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
    theme,
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
