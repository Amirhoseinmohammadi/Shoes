"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

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
  theme: string;
  sendData: (data: any) => void;
  closeApp: () => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string) => Promise<boolean>;
  checkAdminAccess: () => boolean;
  logout: () => Promise<void>;
  loginWithTelegram: (userData: TelegramUser) => Promise<void>;
}

export function useTelegram(): UseTelegramReturn {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramEnv, setIsTelegramEnv] = useState(false);
  const [theme, setTheme] = useState<string>("light");

  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const ADMIN_USER_ID = useMemo(
    () =>
      process.env.NEXT_PUBLIC_ADMIN_USER_ID
        ? parseInt(process.env.NEXT_PUBLIC_ADMIN_USER_ID)
        : 697803275,
    [],
  );

  // وضعیت احراز هویت از NextAuth
  const isAuthenticated = useMemo(() => {
    return status === "authenticated" && !!session?.user;
  }, [session, status]);

  // بررسی آیا کاربر ادمین است
  const isAdmin = useMemo(() => {
    return session?.user?.role === "ADMIN" || user?.id === ADMIN_USER_ID;
  }, [session, user, ADMIN_USER_ID]);

  const initializeTelegram = useCallback(async () => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      console.warn("❌ محیط تلگرام یافت نشد");
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

      // اگر کاربر لاگین نکرده، با تلگرام لاگین کن
      if (status === "unauthenticated") {
        await loginWithTelegram(userData);
      }
    } catch (err: any) {
      console.error("❌ خطا در initialize تلگرام:", err);
      setError("خطا در احراز هویت تلگرام");
    } finally {
      setLoading(false);
    }
  }, [status]);

  const loginWithTelegram = useCallback(async (userData: TelegramUser) => {
    try {
      console.log("🔐 شروع لاگین با NextAuth");

      const result = await signIn("telegram", {
        telegramId: userData.id.toString(),
        firstName: userData.first_name,
        lastName: userData.last_name,
        username: userData.username,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      console.log("✅ لاگین با NextAuth موفق");

      // رفرش صفحه برای به روزرسانی session
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error("❌ خطا در لاگین با NextAuth:", err);
      setError("خطا در احراز هویت");
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut({
        redirect: false,
        callbackUrl: "/",
      });
      setUser(null);
      router.push("/");
    } catch (err) {
      console.error("❌ خطا در خروج:", err);
    }
  }, [router]);

  const checkAdminAccess = useCallback(
    (userId?: number): boolean => {
      // بررسی از طریق session NextAuth
      if (session?.user?.role !== "ADMIN") {
        // یا بررسی از طریق تلگرام
        if (userId && userId !== ADMIN_USER_ID) {
          console.warn("🚫 دسترسی غیرمجاز - کاربر ID:", userId);
          router.push("/access-denied");
          return false;
        }
      }
      return true;
    },
    [session, ADMIN_USER_ID, router],
  );

  useEffect(() => {
    initializeTelegram();
  }, [initializeTelegram]);

  // بررسی دسترسی ادمین هنگام تغییر مسیر
  useEffect(() => {
    if (pathname?.startsWith("/admin")) {
      const hasAccess = checkAdminAccess(user?.id);
      if (!hasAccess) {
        return;
      }
    }
  }, [user, pathname, checkAdminAccess]);

  // همگام‌سازی user state با session
  useEffect(() => {
    if (session?.user && !user) {
      // اگر session داریم اما user state نداریم، آن را تنظیم کنیم
      setUser({
        id: session.user.telegramId,
        first_name: session.user.firstName,
        last_name: session.user.lastName,
        username: session.user.username,
      });
    }
  }, [session, user]);

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

  return {
    user,
    loading: loading || status === "loading",
    error,
    isTelegram: isTelegramEnv,
    isAdmin,
    isAuthenticated,
    theme,
    sendData,
    closeApp,
    showAlert,
    showConfirm,
    checkAdminAccess: () => checkAdminAccess(user?.id),
    logout,
    loginWithTelegram,
  };
}
