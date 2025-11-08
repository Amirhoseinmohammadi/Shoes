import { NextRequest, NextResponse } from "next/server";
import { validateInitData, isInitDataExpired } from "@/lib/telegram-validator";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { initData } = body;

    console.log("📨 validate-init called with:", {
      initData: initData?.substring(0, 50),
    });

    if (!initData) {
      console.error("❌ No initData provided");
      return NextResponse.json({ error: "initData required" }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    console.log("🔑 Bot token exists?", !!botToken);

    if (!botToken) {
      console.error("❌ TELEGRAM_BOT_TOKEN not configured!");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const isValid = validateInitData(initData, botToken);
    console.log("✓ Signature valid?", isValid);

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
      console.error("❌ Telegram data expired");
      return NextResponse.json(
        { error: "Telegram data expired" },
        { status: 401 },
      );
    }

    const userData = params.get("user");
    if (!userData) {
      console.error("❌ No user data in initData");
      return NextResponse.json(
        { error: "No user data found" },
        { status: 400 },
      );
    }

    const user = JSON.parse(userData);
    const isAdmin =
      user.id.toString() === process.env.NEXT_PUBLIC_ADMIN_USER_ID;

    console.log("✅ User authenticated:", { id: user.id, isAdmin });

    await setSessionCookie({
      userId: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      isAdmin,
    });

    console.log("✅ Session cookie set");

    return NextResponse.json({
      success: true,
      user: { ...user, isAdmin },
    });
  } catch (error) {
    console.error("❌ Validation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
