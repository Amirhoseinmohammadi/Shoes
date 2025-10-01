import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    console.log("Incoming update:", JSON.stringify(update, null, 2));

    if (
      "message" in update &&
      update.message &&
      update.message.text === "/start"
    ) {
      const chatId = update.message.chat.id;
      console.log("Start received from user:", update.message.from?.id);

      const response = await axios.post(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
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
        },
      );

      console.log("SendMessage response:", response.data);
    } else if ("message" in update && update.message) {
      await axios.post(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: update.message.chat.id,
          text: "برای شروع، /start بزن!",
        },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Bot handler error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
