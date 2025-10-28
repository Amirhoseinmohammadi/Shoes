"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  const { data: session, status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);

  const isSessionLoading = status === "loading";

  const loginWithTelegram = useCallback(async (tgUser: TelegramUser) => {
    try {
      console.log("🔵 شروع احراز هویت تلگرام با داده:", tgUser);

      const result = await signIn("telegram", {
        redirect: false,
        telegramId: tgUser.id.toString(),
        firstName: tgUser.first_name || "",
        lastName: tgUser.last_name || "",
        username: tgUser.username || "",
      });

      console.log("✅ نتیجه احراز هویت:", result);

      if (result?.error) {
        console.error("❌ خطا در احراز هویت:", result.error);
      } else {
        console.log("✅ احراز هویت موفق!");
      }
    } catch (error) {
      console.error("❌ خطا در loginWithTelegram:", error);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    setUser(null);
    router.push("/");
  }, [router]);

  useEffect(() => {
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
    tg.ready();
    tg.expand();

    const tgUser: TelegramUser = tg.initDataUnsafe?.user;
    console.log("👤 اطلاعات کاربر تلگرام:", tgUser);

    if (tgUser?.id) {
      setUser(tgUser);
      loginWithTelegram(tgUser);
    } else {
      console.log("⚠️ اطلاعات کاربر تلگرام موجود نیست");
      setLoading(false);
    }
  }, [loginWithTelegram]);

  useEffect(() => {
    if (!isSessionLoading) {
      if (session?.user) {
        console.log("✅ Session موجود است:", session.user);
        setUser({
          id: session.user.telegramId,
          first_name: session.user.firstName,
          last_name: session.user.lastName,
          username: session.user.username,
        });
      }
      setLoading(false);
    }
  }, [session, isSessionLoading]);

  const isAuthenticated = !!user;

  return {
    user,
    loading,
    isTelegram,
    loginWithTelegram,
    logout,
    isAuthenticated,
  };
}
