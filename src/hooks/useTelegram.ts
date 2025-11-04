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

  // ✅ NEW: Track if initialized to prevent double-initialization
  const initializedRef = useRef(false);

  // ✅ NEW: Memoize sendData to prevent function recreation
  const sendData = useCallback((data: any) => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;
    tg.sendData?.(JSON.stringify(data));
  }, []);

  // ✅ NEW: Memoize logout
  const logout = useCallback(() => {
    setUser(null);
    // ✅ NEW: Call logout API to clear server-side session
    fetch("/api/auth/logout", { method: "POST" }).catch(console.error);
  }, []);

  // ✅ NEW: Validate with server and get/create session
  const validateAndSetUser = useCallback(async (tgUser: TelegramUser) => {
    if (!tgUser?.id) return;

    try {
      // ✅ NEW: Get initData from Telegram WebApp
      const tg = (window as any).Telegram?.WebApp;
      if (!tg?.initData) {
        console.error("❌ No initData available");
        return;
      }

      // ✅ NEW: Send to server for validation and session creation
      const response = await fetch("/api/validate-init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tg.initData }),
        credentials: "include", // ✅ Include cookies
      });

      if (!response.ok) {
        console.error("❌ Server validation failed:", response.status);
        return;
      }

      const result = await response.json();

      if (result.success) {
        // ✅ NEW: Set user with admin status from server
        const validatedUser: TelegramUser = {
          ...tgUser,
          isAdmin: result.user.isAdmin,
        };
        setUser(validatedUser);
        localStorage.setItem("telegramUser", JSON.stringify(validatedUser));
        console.log("✅ User validated and session created:", validatedUser.id);
      } else {
        console.error("❌ Validation failed:", result.error);
      }
    } catch (error) {
      console.error("❌ Error validating user:", error);
    }
  }, []);

  useEffect(() => {
    // ✅ NEW: Prevent double-initialization
    if (initializedRef.current) {
      console.log("⏭️ Skipping re-initialization (already initialized)");
      return;
    }

    if (typeof window === "undefined") return;

    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      console.log("⚠️ تلگرام WebApp در دسترس نیست");
      setIsTelegram(false);
      setLoading(false);
      initializedRef.current = true;
      return;
    }

    console.log("✅ تلگرام WebApp پیدا شد");
    setIsTelegram(true);

    try {
      tg.ready?.();
      tg.expand?.();

      const tgUser: TelegramUser = tg.initDataUnsafe?.user;
      console.log("👤 اطلاعات کاربر تلگرام:", tgUser);

      if (tgUser?.id) {
        console.log("✅ User found:", tgUser.id);

        // ✅ NEW: Validate with server instead of direct login
        validateAndSetUser(tgUser);
      } else {
        console.error("❌ No user ID found in Telegram data");
      }
    } catch (error) {
      console.error("❌ Error initializing Telegram:", error);
    } finally {
      setLoading(false);
      initializedRef.current = true; // ✅ Mark as initialized
    }
  }, []); // ✅ FIXED: Empty dependency array - runs only once

  const isAuthenticated = !!user;

  return {
    user,
    loading,
    sendData,
    isTelegram,
    logout,
    isAuthenticated,
    isAdmin: user?.isAdmin || false, // ✅ NEW: Return isAdmin
  };
}
