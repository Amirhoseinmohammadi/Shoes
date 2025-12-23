import { NextRequest, NextResponse } from "next/server";
import { validateInitData, isInitDataExpired } from "@/lib/telegram-validator";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json();

    if (!initData) {
      return NextResponse.json(
        { success: false, error: "initData required" },
        { status: 400 },
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error("❌ TELEGRAM_BOT_TOKEN missing");
      return NextResponse.json(
        { success: false, error: "Server misconfigured" },
        { status: 500 },
      );
    }

    if (!validateInitData(initData, botToken)) {
      return NextResponse.json(
        { success: false, error: "Invalid Telegram data" },
        { status: 401 },
      );
    }

    const params = new URLSearchParams(initData);
    const authDate = params.get("auth_date");

    if (isInitDataExpired(authDate)) {
      return NextResponse.json(
        { success: false, error: "Telegram data expired" },
        { status: 401 },
      );
    }

    const userRaw = params.get("user");
    if (!userRaw) {
      return NextResponse.json(
        { success: false, error: "No user data" },
        { status: 400 },
      );
    }

    const tgUser = JSON.parse(userRaw);

    // ✅ telegramId as STRING
    const telegramId = String(tgUser.id);

    const dbUser = await prisma.user.upsert({
      where: { telegramId },
      update: {
        firstName: tgUser.first_name || null,
        lastName: tgUser.last_name || null,
        username: tgUser.username || null,
      },
      create: {
        telegramId,
        firstName: tgUser.first_name || null,
        lastName: tgUser.last_name || null,
        username: tgUser.username || null,
      },
    });

    await clearSessionCookie();
    await setSessionCookie({
      userId: dbUser.id,
      firstName: dbUser.firstName ?? undefined,
      lastName: dbUser.lastName ?? undefined,
      username: dbUser.username ?? undefined,
      isAdmin: false,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        telegramId: dbUser.telegramId,
        first_name: dbUser.firstName,
        last_name: dbUser.lastName,
        username: dbUser.username,
        isAdmin: false,
      },
    });
  } catch (err) {
    console.error("❌ validate-init error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
