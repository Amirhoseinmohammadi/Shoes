import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    console.log("📩 Incoming update:", JSON.stringify(update, null, 2));

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error("❌ TELEGRAM_BOT_TOKEN not found in env");
      return NextResponse.json({ ok: false, error: "Bot token missing" });
    }

    // فوراً پاسخ بده به تلگرام تا وبهوک خطای 500 نده
    const response = NextResponse.json({ ok: true });

    // پردازش async بعد از پاسخ
    (async () => {
      const chatId = update.message?.chat?.id;
      const text = update.message?.text;

      if (!chatId) {
        console.warn("⚠️ Update has no chatId:", update);
        return;
      }

      try {
        if (text === "/start") {
          console.log(
            "✅ /start received from user:",
            update.message?.from?.id,
          );

          await axios.post(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
              chat_id: chatId,
              text: "👋 سلام! به فروشگاه کفش خوش اومدی! (تست بدون دکمه – بعداً اضافه می‌شه)",
            },
          );
        } else {
          await axios.post(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
              chat_id: chatId,
              text: "برای شروع، /start بزن!",
            },
          );
        }
      } catch (err: any) {
        console.error(
          "❌ Telegram sendMessage error:",
          err.response?.data || err.message,
        );
      }
    })();

    return response;
  } catch (err: any) {
    console.error("❌ Bot handler fatal error:", err.stack || err.message);
    // حتی در صورت خطای غیرمنتظره، 200 بده تا تلگرام دوباره وبهوک را قطع نکند
    return NextResponse.json({ ok: true });
  }
}

export const dynamic = "force-dynamic";
