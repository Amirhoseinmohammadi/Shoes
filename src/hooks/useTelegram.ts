"use client";

import { useState, useEffect, useCallback } from "react";

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);

  const loginWithTelegram = useCallback((tgUser: TelegramUser) => {
    if (!tgUser?.id) return;
    setUser(tgUser);
  }, []);

  const sendData = (data: any) => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;
    tg.sendData?.(JSON.stringify(data));
  };

  // خروج تلگرام
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    // فقط client-side
    if (typeof window === "undefined") return;

    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      console.log("⚠️ تلگرام WebApp در دسترس نیست");
      setIsTelegram(false);
      setLoading(false);
      return;
    }

    console.log("✅ تلگرام WebApp پیدا شد");
    setIsTelegram(true);

    tg.ready?.();
    tg.expand?.();

    const tgUser: TelegramUser = tg.initDataUnsafe?.user;
    console.log("👤 اطلاعات کاربر تلگرام:", tgUser);

    if (tgUser?.id) {
      loginWithTelegram(tgUser);
    }

    setLoading(false);
  }, [loginWithTelegram]);

  const isAuthenticated = !!user;

  return {
    user,
    loading,
    sendData,
    isTelegram,
    loginWithTelegram,
    logout,
    isAuthenticated,
  };
}
