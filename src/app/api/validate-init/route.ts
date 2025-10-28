import { NextRequest, NextResponse } from "next/server";

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

    const params = new URLSearchParams(initData);
    const userData = params.get("user");

    if (!userData) {
      return NextResponse.json(
        { error: "No user data found" },
        { status: 400 },
      );
    }

    const user: TelegramUser = JSON.parse(userData);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error parsing Telegram init data:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
