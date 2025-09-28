import { Telegraf } from "telegraf";

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

export async function POST(req: Request) {
  try {
    const json = await req.json();

    console.log("Incoming update:", JSON.stringify(json, null, 2));

    bot
      .handleUpdate(json)
      .catch((err) => console.error("Bot handler error:", err));
  } catch (err) {
    console.error("Bot handler error:", err);
  }

  return new Response(null, { status: 200 });
}
