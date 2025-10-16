"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export default function TelegramWebApp() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) {
      setLoading(false);
      return;
    }

    tg.ready();
    tg.expand();

    const initData = tg.initData;
    if (initData) {
      validateUser(initData);
    } else {
      setLoading(false);
    }
  }, []);

  const validateUser = async (initData: string) => {
    try {
      setLoading(true);

      // ✅ استفاده از apiClient.telegram.validateInit
      const response = await apiClient.telegram.validateInit(initData);

      if (response.valid && response.payload?.user) {
        setUser(response.payload.user);
        localStorage.setItem(
          "telegramUser",
          JSON.stringify(response.payload.user),
        );
      } else {
        console.warn("Invalid initData", response);
      }
    } catch (error) {
      console.error("Error validating Telegram user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.sendData(JSON.stringify({ action: "checkout" }));
    }
  };

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <main style={{ padding: 16 }}>
        <h1>🛍 فروشگاه تلگرام</h1>

        {loading && <p>در حال شناسایی کاربر...</p>}

        {!loading && !user && <p>خطا در شناسایی کاربر تلگرام</p>}

        {user && (
          <div>
            <p>
              خوش اومدی، <b>{user.first_name}</b>
              {user.username && ` (@${user.username})`}
            </p>

            <button
              onClick={handleCheckout}
              style={{
                padding: "10px 20px",
                backgroundColor: "#0088cc",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              ارسال سبد خرید
            </button>
          </div>
        )}
      </main>
    </>
  );
}
