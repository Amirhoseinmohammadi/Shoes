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
  const initializingRef = useRef(false);
  const mountedRef = useRef(true);

  const sendData = useCallback((data: any) => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return false;
    tg.sendData?.(JSON.stringify(data));
    return true;
  }, []);

  const logout = useCallback(async () => {
    if (mountedRef.current) {
      setUser(null);
    }

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      if (mountedRef.current) {
        window.location.href = "/";
      }
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
          if (mountedRef.current) {
            setIsTelegram(false);
            setLoading(false);
          }
          return;
        }

        if (mountedRef.current) {
          setIsTelegram(true);
        }

        try {
          tg.ready?.();
          tg.expand?.();
        } catch {}

        const tgUser: TelegramUser = tg.initDataUnsafe?.user;

        if (!tgUser?.id || !tg.initData) {
          if (mountedRef.current) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        const response = await fetch("/api/validate-init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData: tg.initData }),
          credentials: "include",
        });

        if (!response.ok) {
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

          if (mountedRef.current) {
            setUser(validatedUser);
          }
        } else {
          if (mountedRef.current) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Telegram init error:", error);
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
    isAdmin: user?.isAdmin ?? false,
  };
}
