// src/app/api/telegram/bot/route.ts – نسخه رفع‌شده با log بیشتر و چک env
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    console.log("Incoming update:", JSON.stringify(update, null, 2));

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error("TELEGRAM_BOT_TOKEN not found in env");
      return NextResponse.json({ error: "Bot token missing" }, { status: 500 });
    }
    console.log("Token length:", botToken.length); // دیباگ: طول token (باید ~45 باشه)

    if (
      "message" in update &&
      update.message &&
      update.message.text === "/start"
    ) {
      const chatId = update.message.chat.id;
      console.log("Start received from user:", update.message.from?.id);

      const messageBody = {
        chat_id: chatId,
        text: "👋 سلام! به فروشگاه کفش خوش اومدی!",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🛍 ورود به فروشگاه",
                web_app: { url: "https://shoes-production.up.railway.app" },
              },
            ],
          ],
        },
      };

      console.log("Send body:", JSON.stringify(messageBody, null, 2)); // دیباگ body

      const response = await axios.post(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        messageBody,
      );

      console.log("SendMessage response:", response.data);
    } else if ("message" in update && update.message) {
      const fallbackBody = {
        chat_id: update.message.chat.id,
        text: "برای شروع، /start بزن!",
      };

      console.log("Fallback body:", JSON.stringify(fallbackBody, null, 2));

      const fallbackResponse = await axios.post(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        fallbackBody,
      );

      console.log("Fallback response:", fallbackResponse.data);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Bot handler error:", err);
    console.error(
      "Full error:",
      (err as any).response?.data || (err as Error).message,
    ); // دیباگ کامل error
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
