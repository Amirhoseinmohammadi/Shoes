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

const userCache = {
  data: null as TelegramUser | null,
  validatedAt: 0,
};

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);
  const initializingRef = useRef(false);
  const mountedRef = useRef(true);

  const sendData = useCallback((data: any) => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;
    tg.sendData?.(JSON.stringify(data));
  }, []);

  const logout = useCallback(async () => {
    if (mountedRef.current) {
      setUser(null);
    }
    userCache.data = null;
    userCache.validatedAt = 0;

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("❌ Logout error:", err);
    }
  }, []);

  useEffect(() => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    if (typeof window === "undefined") {
      if (mountedRef.current) {
        setLoading(false);
      }
      return;
    }

    const initTelegram = async () => {
      try {
        const tg = (window as any).Telegram?.WebApp;

        if (!tg) {
          console.log("⚠️ Telegram WebApp not available");
          if (mountedRef.current) {
            setIsTelegram(false);
            setLoading(false);
          }
          return;
        }

        console.log("✅ Telegram WebApp found");
        if (mountedRef.current) {
          setIsTelegram(true);
        }

        try {
          tg.ready?.();
          tg.expand?.();
        } catch (e) {
          console.warn("⚠️ Could not call Telegram methods:", e);
        }

        const tgUser: TelegramUser = tg.initDataUnsafe?.user;

        if (!tgUser?.id) {
          console.error("❌ No user ID found in Telegram data");
          if (mountedRef.current) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        console.log("👤 User found in Telegram:", tgUser.id);

        const now = Date.now();
        const cacheAge = now - userCache.validatedAt;

        if (userCache.data && cacheAge < 5 * 60 * 1000) {
          console.log("✅ Using cached user:", userCache.data.id);
          if (mountedRef.current) {
            setUser(userCache.data);
            setLoading(false);
          }
          return;
        }

        if (!tg.initData) {
          console.error("❌ No initData available");
          if (mountedRef.current) {
            setUser(null);
            setLoading(false);
          }
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
          if (mountedRef.current) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        const result = await response.json();

        if (result.success && result.user) {
          const validatedUser: TelegramUser = {
            ...tgUser,
            isAdmin: result.user.isAdmin,
          };

          userCache.data = validatedUser;
          userCache.validatedAt = now;

          if (mountedRef.current) {
            setUser(validatedUser);
            console.log("✅ Auth successful:", validatedUser.id);
          }

          try {
            localStorage.setItem("telegramUser", JSON.stringify(validatedUser));
          } catch (e) {
            console.warn("⚠️ Could not save to localStorage:", e);
          }
        } else {
          console.error("❌ Validation failed:", result.error);
          if (mountedRef.current) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error("❌ Telegram init error:", error);
        if (mountedRef.current) {
          setUser(null);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      if ((window as any).Telegram?.WebApp || attempts >= 50) {
        clearInterval(checkInterval);
        initTelegram();
      }
    }, 100);

    return () => {
      clearInterval(checkInterval);
    };
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    user,
    loading,
    sendData,
    isTelegram,
    logout,
    isAuthenticated: !!user?.id,
    isAdmin: user?.isAdmin || false,
  };
}
