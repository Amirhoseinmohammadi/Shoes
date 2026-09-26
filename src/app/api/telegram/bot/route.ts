import { NextRequest, NextResponse } from "next/server";
import { errorResponse, successResponse, unauthorizedResponse } from "@/lib/apiResponse";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error("❌ TELEGRAM_BOT_TOKEN not found in env");
      return NextResponse.json({ ok: false, error: "Bot token missing" });
    }

    const response = NextResponse.json({ ok: true });

    (async () => {
      const chatId = update.message?.chat?.id;
      const text = update.message?.text;

      if (!chatId) {
        console.warn("⚠️ Update has no chatId:", update);
        return;
      }

      try {
        if (text === "/start") {
          

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
    return NextResponse.json({ ok: true });
  }
}

export const dynamic = "force-dynamic";
