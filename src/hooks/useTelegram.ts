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

  const isAuthenticated = useMemo(
    () => status === "authenticated" && !!session?.user,
    [status, session],
  );

  const isAdmin = useMemo(
    () =>
      session?.user?.role === "ADMIN" || (user && user.id === ADMIN_USER_ID),
    [session, user, ADMIN_USER_ID],
  );

  // تابع ورود با تلگرام بدون reload
  const loginWithTelegram = useCallback(async (userData: TelegramUser) => {
    try {
      const result = await signIn("telegram", {
        telegramId: userData.id.toString(),
        firstName: userData.first_name,
        lastName: userData.last_name,
        username: userData.username,
        redirect: false,
      });

      if (result?.error) throw new Error(result.error);

      setUser(userData);
      console.log("✅ ورود موفق با Telegram + NextAuth");
    } catch (err: any) {
      console.error("❌ خطا در ورود با Telegram:", err);
      setError("ورود ناموفق بود");
    }
  }, []);

  const initializeTelegram = useCallback(async () => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      setIsTelegramEnv(false);
      setLoading(false);
      return;
    }

    try {
      tg.ready();
      tg.expand();
      setIsTelegramEnv(true);
      setTheme(tg.colorScheme || "light");

      const userData: TelegramUser | undefined = tg.initDataUnsafe?.user;

      // اگر کاربر تلگرام موجود هست و session هنوز unauthenticated است
      if (userData?.id && status === "unauthenticated") {
        await loginWithTelegram(userData);
      }

      // اگر session فعال هست ولی user خالیه، user رو set کن
      if (isAuthenticated && !user && session?.user?.telegramId) {
        setUser({
          id: session.user.telegramId,
          first_name: session.user.firstName,
          last_name: session.user.lastName,
          username: session.user.username,
        });
      }
    } catch (err: any) {
      console.error("❌ خطا در initialize تلگرام:", err);
      setError("خطا در احراز هویت تلگرام");
    } finally {
      setLoading(false);
    }
  }, [loginWithTelegram, session, status, isAuthenticated, user]);

  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: false });
      setUser(null);
      router.push("/");
    } catch (err) {
      console.error("❌ خطا در خروج:", err);
    }
  }, [router]);

  const checkAdminAccess = useCallback(
    (userId?: number): boolean => {
      const isAuthorized =
        session?.user?.role === "ADMIN" || userId === ADMIN_USER_ID;

      if (!isAuthorized) {
        console.warn("🚫 دسترسی غیرمجاز برای کاربر:", userId);
        router.push("/access-denied");
        return false;
      }
      return true;
    },
    [session, ADMIN_USER_ID, router],
  );

  useEffect(() => {
    initializeTelegram();
  }, [initializeTelegram]);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) {
      checkAdminAccess(user?.id);
    }
  }, [user, pathname, checkAdminAccess]);

  const sendData = useCallback((data: any) => {
    const tg = (window as any).Telegram?.WebApp;
    tg?.sendData(JSON.stringify(data));
  }, []);

  const closeApp = useCallback(() => {
    const tg = (window as any).Telegram?.WebApp;
    tg?.close();
  }, []);

  const showAlert = useCallback((message: string) => {
    const tg = (window as any).Telegram?.WebApp;
    tg?.showAlert?.(message) ?? alert(message);
  }, []);

  const showConfirm = useCallback(
    (message: string): Promise<boolean> =>
      new Promise((resolve) => {
        const tg = (window as any).Telegram?.WebApp;
        if (tg?.showConfirm) {
          tg.showConfirm(message, (confirmed: boolean) => resolve(confirmed));
        } else {
          resolve(confirm(message));
        }
      }),
    [],
  );

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
