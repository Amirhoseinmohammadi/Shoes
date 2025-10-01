import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    console.log("📩 Incoming update:", JSON.stringify(update, null, 2));

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error("❌ TELEGRAM_BOT_TOKEN not found in env");
      return NextResponse.json({ error: "Bot token missing" }, { status: 500 });
    }

    const chatId = update.message?.chat?.id;
    const text = update.message?.text;

    if (!chatId) {
      console.warn("⚠️ Update has no chatId:", update);
      return NextResponse.json({ ok: true }); // نمی‌ریزیم روی 500
    }

    if (text === "/start") {
      console.log("✅ /start received from user:", update.message?.from?.id);

      const messageBody = {
        chat_id: chatId,
        text: "👋 سلام! به فروشگاه کفش خوش اومدی! (تست بدون دکمه – بعداً اضافه می‌شه)",
      };

      const response = await axios.post(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        messageBody,
      );

      console.log("📤 SendMessage response:", response.data);
    } else {
      const fallbackBody = {
        chat_id: chatId,
        text: "برای شروع، /start بزن!",
      };

      const fallbackResponse = await axios.post(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        fallbackBody,
      );

      console.log("📤 Fallback response:", fallbackResponse.data);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.response?.status === 401) {
      console.error("❌ Invalid Bot Token! Check TELEGRAM_BOT_TOKEN");
      return NextResponse.json({ error: "Invalid Bot Token" }, { status: 401 });
    }

    console.error("❌ Bot handler error:", err.message);
    console.error("📄 Full error response:", err.response?.data || err.stack);

    return NextResponse.json(
      { error: "Internal bot error", details: err.message },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
