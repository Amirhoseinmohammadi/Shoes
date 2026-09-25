"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { apiClient } from "@/lib/api-client";
import { AuthUser } from "@/types/auth";

export default function TelegramWebApp() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initTelegram = async () => {
      try {
        const tg = (window as any).Telegram?.WebApp;
        if (!tg) {
          console.warn("⚠️ Telegram WebApp not found.");
          setLoading(false);
          return;
        }

        console.log("📲 Telegram WebApp detected:", tg.version);
        tg.ready();
        tg.expand();
        tg.enableClosingConfirmation(false);

        const initData = tg?.initDataUnsafe || tg?.initData;
        console.log("📦 initData received:", initData);

        if (initData && Object.keys(initData).length > 0) {
          await validateUser(tg.initData);
        } else {
          console.warn("⚠️ No initData found, skipping validation.");
        }
      } catch (error) {
        console.error("❌ Telegram initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initTelegram();
  }, []);

  const validateUser = async (initData: string) => {
    try {
      setLoading(true);
      const response = await apiClient.telegram.validateInit(initData);
      console.log("✅ Telegram validation response:", response);

      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem(
          "telegramUser",
          JSON.stringify(response.user),
        );
      } else {
        console.warn("🚫 Invalid initData", response);
      }
    } catch (error) {
      console.error("❌ Error validating Telegram user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.sendData(JSON.stringify({ action: "checkout" }));
      console.log("🛒 Checkout data sent to Telegram");
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
        {!loading && !user && <p>❌ خطا در شناسایی کاربر تلگرام</p>}

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
