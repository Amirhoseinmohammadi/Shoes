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
    : 1;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const tg = (window as any).Telegram?.WebApp;

    if (tg) {
      tg.ready();
      const userData = tg.initDataUnsafe?.user;

      if (userData) {
        setUser(userData);
        console.log("👤 کاربر تلگرام:", userData);
        console.log("🆔 ADMIN_USER_ID:", ADMIN_USER_ID);

        if (
          window.location.pathname.startsWith("/admin") &&
          userData.id !== ADMIN_USER_ID
        ) {
          console.log("🚫 دسترسی غیرمجاز - کاربر ID:", userData.id);
          router.push("/access-denied");
        }
      }

      setIsLoading(false);
    } else {
      if (window.location.pathname.startsWith("/admin")) {
        console.log("🌐 دسترسی غیرمجاز - محیط غیرتلگرام");
        router.push("/access-denied");
      }
      setIsLoading(false);
    }
  }, [router, ADMIN_USER_ID]);

  return { user, isLoading };
}
