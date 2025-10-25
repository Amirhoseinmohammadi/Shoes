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

      let userData: TelegramUser | undefined = tg.initDataUnsafe?.user;

      if (!userData && tg.initData) {
        const params = new URLSearchParams(tg.initData);
        const id = params.get("id");
        if (id) {
          userData = {
            id: parseInt(id),
            first_name: params.get("first_name") || "",
            last_name: params.get("last_name") || "",
            username: params.get("username") || "",
          };
        }
      }

      if (userData) {
        setUser(userData);
        await loginToNextAuth(userData, tg.initData || "");
      } else {
        setError("تلگرام داده کاربر نداد");
      }
    } catch (err) {
      setError("خطا در احراز هویت تلگرام");
    } finally {
      setLoading(false);
    }
  }, []);

  const loginToNextAuth = useCallback(
    async (userData: TelegramUser, initData: string) => {
      try {
        const params = new URLSearchParams(initData);
        const authDate = params.get("auth_date") || "";
        const hash = params.get("hash") || "";
        await signIn("telegram", {
          redirect: false,
          id: userData.id.toString(),
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          username: userData.username || "",
          auth_date: authDate,
          hash: hash,
        });
      } catch {
        setError("خطا در احراز هویت NextAuth");
      }
    },
    [],
  );

  useEffect(() => {
    initializeTelegram();
  }, [initializeTelegram]);

  const isAdmin = useMemo(
    () => user?.id === ADMIN_USER_ID,
    [user, ADMIN_USER_ID],
  );

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
    tg?.showAlert ? tg.showAlert(message) : alert(message);
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
    isAuthenticated: status === "authenticated",
    session,
    sendData,
    closeApp,
    showAlert,
    showConfirm,
  };
}
