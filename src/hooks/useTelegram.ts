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

// ✅ Global state برای جلوگیری از multiple validations
const userCache = {
  data: null as TelegramUser | null,
  validatedAt: 0,
  validating: false,
};

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);
  const initializedRef = useRef(false);

  const sendData = useCallback((data: any) => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;
    tg.sendData?.(JSON.stringify(data));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    userCache.data = null;
    userCache.validatedAt = 0;
    fetch("/api/auth/logout", { method: "POST" }).catch(console.error);
  }, []);

  const validateAndSetUser = useCallback(async (tgUser: TelegramUser) => {
    if (!tgUser?.id) return;

    try {
      // ✅ Check if already validating
      if (userCache.validating) {
        console.log("⏳ Validation already in progress");
        return;
      }

      // ✅ Check cache (valid for 10 minutes)
      const now = Date.now();
      const cacheAge = now - userCache.validatedAt;
      if (userCache.data && cacheAge < 10 * 60 * 1000) {
        console.log("✅ Using cached user:", userCache.data.id);
        setUser(userCache.data);
        setLoading(false);
        return;
      }

      userCache.validating = true;

      const tg = (window as any).Telegram?.WebApp;
      if (!tg?.initData) {
        console.error("❌ No initData available");
        setLoading(false);
        userCache.validating = false;
        return;
      }

      console.log("📤 Validating with server...");
      const response = await fetch("/api/validate-init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tg.initData }),
        credentials: "include",
      });

      if (!response.ok) {
        console.error("❌ Server validation failed:", response.status);
        setLoading(false);
        userCache.validating = false;
        return;
      }

      const result = await response.json();

      if (result.success && result.user) {
        const validatedUser: TelegramUser = {
          ...tgUser,
          isAdmin: result.user.isAdmin,
        };

        // ✅ Cache user
        userCache.data = validatedUser;
        userCache.validatedAt = now;

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
      userCache.validating = false;
    }
  }, []);

  useEffect(() => {
    // ✅ Skip if already initialized
    if (initializedRef.current) return;

    if (typeof window === "undefined") {
      setLoading(false);
      initializedRef.current = true;
      return;
    }

    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      console.log("⚠️ Telegram WebApp not available");
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

      if (tgUser?.id) {
        console.log("👤 User found:", tgUser.id);
        validateAndSetUser(tgUser);
      } else {
        console.error("❌ No user ID found");
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
    sendData,
    isTelegram,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
  };
}
