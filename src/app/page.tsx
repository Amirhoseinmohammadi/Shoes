"use client";

import { useEffect, useState } from "react";
import ScrollUp from "@/components/Common/ScrollUp";
import Products from "@/components/Products";
import Hero from "@/components/Hero";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export default function Home() {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [isWebAppReady, setIsWebAppReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      const user = tg.initDataUnsafe?.user;
      setTelegramUser(user || null);
      setIsWebAppReady(true);

      console.log("WebApp init in Home:", user);
    }
  }, []);

  return (
    <>
      <ScrollUp />
      <Hero />
      {isWebAppReady && telegramUser && (
        <div className="bg-green-100 py-2 text-center text-green-800">
          خوش اومدی، {telegramUser.first_name}! 👋
        </div>
      )}
      {!isWebAppReady && (
        <div className="bg-blue-100 py-2 text-center text-blue-800">
          در حال اتصال به تلگرام...
        </div>
      )}
      <Products />
    </>
  );
}
