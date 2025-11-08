"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  isAdmin?: boolean;
}

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);
  const initializedRef = useRef(false);

  const validateAndSetUser = useCallback(async (tgUser: TelegramUser) => {
    if (!tgUser?.id) return;

    try {
      const tg = (window as any).Telegram?.WebApp;
      if (!tg?.initData) {
        console.error("❌ No initData available");
        setLoading(false);
        return;
      }

      console.log("📤 Validating with server...");
      const response = await fetch("/api/validate-init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tg.initData }),
        credentials: "include",
      });

      const result = await response.json();
      console.log("📥 Server response:", result);

      if (result.success && result.user) {
        const validatedUser: TelegramUser = {
          ...tgUser,
          isAdmin: result.user.isAdmin,
        };
        setUser(validatedUser);
        localStorage.setItem("telegramUser", JSON.stringify(validatedUser));
        console.log("✅ Auth successful:", validatedUser.id);
      } else {
        console.error("❌ Validation failed:", result.error);
        setUser(null);
      }
    } catch (error) {
      console.error("❌ Validation error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;

    if (typeof window === "undefined") {
      setLoading(false);
      initializedRef.current = true;
      return;
    }

    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      console.warn("⚠️ Telegram WebApp not available");
      setIsTelegram(false);
      setLoading(false);
      initializedRef.current = true;
      return;
    }

    console.log("✅ Telegram WebApp found");
    setIsTelegram(true);

    try {
      tg.ready?.();
      tg.expand?.();

      const tgUser: TelegramUser = tg.initDataUnsafe?.user;
      console.log("👤 Telegram user:", tgUser);

      if (tgUser?.id) {
        validateAndSetUser(tgUser);
      } else {
        console.error("❌ No user in Telegram data");
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ Telegram init error:", error);
      setLoading(false);
    }

    initializedRef.current = true;
  }, [validateAndSetUser]);

  return {
    user,
    loading,
    isTelegram,
    isAdmin: user?.isAdmin || false,
  };
}
