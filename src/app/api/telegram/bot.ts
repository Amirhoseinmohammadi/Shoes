import { Telegraf } from "telegraf";
import type { NextApiRequest, NextApiResponse } from "next";

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    await bot.handleUpdate(req.body);
  } catch (err) {
    console.error("Bot handler error:", err);
  }
  res.status(200).end();
}
