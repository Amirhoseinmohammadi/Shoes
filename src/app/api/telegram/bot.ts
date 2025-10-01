// src/app/api/telegram/bot/route.ts
import { Telegraf } from "telegraf";
import { NextRequest, NextResponse } from "next/server";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

bot.start((ctx) => {
  console.log("Start command received from user:", ctx.from?.id);
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

bot.on("message", (ctx) => {
  console.log("Message received:", (ctx.message as any)?.text);
  ctx.reply("برای شروع، /start بزن!");
});

bot.catch((err, ctx) => {
  console.error("Bot error:", err);
  if (ctx) ctx.reply("خطایی رخ داد. دوباره امتحان کن.");
});

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    console.log("Incoming update:", JSON.stringify(update, null, 2));

    const fakeRes = {
      statusCode: 200,
      status: (code: number) => ({ end: () => {}, json: () => {} }),
      json: (body: any) => {},
      end: () => {},
      setHeader: (key: string, value: string) => {},
      writeHead: () => {},
      write: () => {},
    };

    await bot.handleUpdate(update, fakeRes as any);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Bot handler error:", err);
    return NextResponse.json(
      { error: "Handler failed", details: err.message },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
