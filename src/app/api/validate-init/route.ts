import { NextRequest, NextResponse } from "next/server";
import { validateInitData, isInitDataExpired } from "@/lib/telegram-validator";
import { setSessionCookie } from "@/lib/session";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { initData } = body;

    if (!initData) {
      return NextResponse.json({ error: "initData required" }, { status: 400 });
    }

    const isValid = validateInitData(
      initData,
      process.env.TELEGRAM_BOT_TOKEN || "",
    );

    if (!isValid) {
      console.error("❌ Telegram signature validation failed");
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

    const userData = params.get("user");

    if (!userData) {
      return NextResponse.json(
        { error: "No user data found" },
        { status: 400 },
      );
    }

    const user: TelegramUser = JSON.parse(userData);

    const isAdmin =
      user.id.toString() === process.env.NEXT_PUBLIC_ADMIN_USER_ID;

    await setSessionCookie({
      userId: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      isAdmin,
    });

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        isAdmin,
      },
    });
  } catch (error) {
    console.error("Error parsing Telegram init data:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
