import { NextRequest, NextResponse } from "next/server";
import { validateInitData, isInitDataExpired } from "@/lib/telegram-validator";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();

    if (!initData) {
      return NextResponse.json({ error: "initData required" }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error("❌ TELEGRAM_BOT_TOKEN not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    if (!validateInitData(initData, botToken)) {
      return NextResponse.json(
        { error: "Invalid Telegram data" },
        { status: 401 },
      );
    }

    const params = new URLSearchParams(initData);
    const authDate = params.get("auth_date");

    if (isInitDataExpired(authDate)) {
      return NextResponse.json(
        { error: "Telegram data expired" },
        { status: 401 },
      );
    }

    const userRaw = params.get("user");
    if (!userRaw) {
      return NextResponse.json(
        { error: "No user data found" },
        { status: 400 },
      );
    }

    const tgUser = JSON.parse(userRaw);

    const dbUser = await prisma.user.upsert({
      where: { telegramId: tgUser.id },
      update: {
        firstName: tgUser.first_name || null,
        lastName: tgUser.last_name || null,
        username: tgUser.username || null,
        updatedAt: new Date(),
      },
      create: {
        telegramId: tgUser.id,
        firstName: tgUser.first_name || null,
        lastName: tgUser.last_name || null,
        username: tgUser.username || null,
      },
    });

    const isAdmin =
      dbUser.telegramId.toString() === process.env.ADMIN_TELEGRAM_ID;

    await clearSessionCookie();

    await setSessionCookie({
      userId: dbUser.id,
      firstName: dbUser.firstName ?? undefined,
      lastName: dbUser.lastName ?? undefined,
      username: dbUser.username ?? undefined,
      isAdmin,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        telegramId: dbUser.telegramId,
        first_name: dbUser.firstName,
        last_name: dbUser.lastName,
        username: dbUser.username,
        isAdmin,
      },
    });
  } catch (error) {
    console.error("❌ validate-init error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
