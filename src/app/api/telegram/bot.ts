// src/app/api/telegram/bot/route.ts
import { Telegraf } from "telegraf";
import { NextRequest, NextResponse } from "next/server";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

bot.start((ctx) => {
  ctx.reply("👋 سلام! به فروشگاه کفش خوش اومدی!", {
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
  });
});

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    const fakeRes = {
      status: (code: number) => ({ end: () => {} }),
      json: () => {},
      end: () => {},
      setHeader: () => {},
    };

    await bot.handleUpdate(update, fakeRes as any);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Bot handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
