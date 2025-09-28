import { Telegraf } from "telegraf";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN missing");

const bot = new Telegraf(BOT_TOKEN);

// وقتی کاربر /start می‌زند
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

export async function POST(req: Request) {
  try {
    const json = await req.json();

    // بدون await => سریعاً پاسخ به تلگرام داده می‌شود
    bot
      .handleUpdate(json)
      .catch((err) => console.error("Bot handler error:", err));
  } catch (err) {
    console.error("Failed to parse request body:", err);
  }

  // سریعاً پاسخ 200 به Telegram
  return new Response(null, { status: 200 });
}
