"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function TelegramWebApp() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    tg.ready();
    tg.expand();

    const raw = tg.initData;
    if (raw) {
      fetch("/api/telegram/validate-init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: raw }),
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.valid) setUser(json.payload?.user);
          else console.warn("invalid initData", json);
        });
    }
  }, []);

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <main style={{ padding: 16 }}>
        <h1>🛍 فروشگاه تلگرام</h1>
        {!user && <p>در حال شناسایی کاربر...</p>}
        {user && (
          <p>
            خوش اومدی، <b>{user.first_name}</b>
          </p>
        )}
        <button
          onClick={() =>
            (window as any).Telegram.WebApp.sendData(
              JSON.stringify({ action: "checkout" }),
            )
          }
        >
          ارسال سبد خرید
        </button>
      </main>
    </>
  );
}
