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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const tg = (window as any).Telegram?.WebApp;

    if (tg) {
      tg.ready();
      const userData = tg.initDataUnsafe?.user;

      if (userData) {
        setUser(userData);

        if (
          window.location.pathname.startsWith("/admin") &&
          userData.id !== 1
        ) {
          router.push("/access-denied");
        }
      }

      setIsLoading(false);
    } else {
      if (window.location.pathname.startsWith("/admin")) {
        router.push("/access-denied");
      }
      setIsLoading(false);
    }
  }, [router]);

  return { user, isLoading };
}
