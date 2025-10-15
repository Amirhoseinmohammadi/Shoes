"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export function useTelegramAuth() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID
    ? parseInt(process.env.NEXT_PUBLIC_ADMIN_USER_ID)
    : 697803275;

  useEffect(() => {
    if (typeof window === "undefined") return;

    console.log("🔍 شروع بررسی احراز هویت...");
    console.log("🆔 ADMIN_USER_ID مورد انتظار:", ADMIN_USER_ID);

    const tg = (window as any).Telegram?.WebApp;

    if (tg) {
      console.log("✅ Telegram Web App پیدا شد");
      tg.ready();
      const userData = tg.initDataUnsafe?.user;

      console.log("👤 داده‌های کاربر:", userData);

      if (userData) {
        setUser(userData);

        console.log("🆔 کاربر:", userData.id, "ادمین:", ADMIN_USER_ID);

        if (window.location.pathname.startsWith("/admin")) {
          if (userData.id === ADMIN_USER_ID) {
            console.log("✅ دسترسی مجاز - کاربر ادمین");
          } else {
            console.log("🚫 دسترسی غیرمجاز - کاربر ID:", userData.id);
            router.push("/access-denied");
          }
        }
      } else {
        console.log("❌ داده کاربر یافت نشد");
        if (window.location.pathname.startsWith("/admin")) {
          router.push("/access-denied");
        }
      }

      setIsLoading(false);
    } else {
      console.log("❌ محیط تلگرام یافت نشد");
      if (window.location.pathname.startsWith("/admin")) {
        router.push("/access-denied");
      }
      setIsLoading(false);
    }
  }, [router, ADMIN_USER_ID]);

  return { user, isLoading };
}
