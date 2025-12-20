import { NextRequest, NextResponse } from "next/server";
import { validateInitData, isInitDataExpired } from "@/lib/telegram-validator";
import { setSessionCookie } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { initData } = body;

    console.log(
      "📨 validate-init called with initData length:",
      initData?.length,
    );

    if (!initData) {
      console.error("❌ No initData provided");
      return NextResponse.json({ error: "initData required" }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error("❌ TELEGRAM_BOT_TOKEN not configured!");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    console.log(
      "🔐 Validating initData with bot token starting with:",
      botToken.substring(0, 10) + "...",
    );

    const isValid = validateInitData(initData, botToken);
    console.log("🔍 Validation result:", isValid);

    if (!isValid) {
      console.error("❌ Telegram signature validation failed");
      console.log("📄 initData received:", initData.substring(0, 200) + "...");
      return NextResponse.json(
        { error: "Invalid Telegram data" },
        { status: 401 },
      );
    }

    const params = new URLSearchParams(initData);
    const authDate = params.get("auth_date");
    console.log("📅 auth_date:", authDate);

    if (isInitDataExpired(authDate)) {
      console.error("❌ Telegram data expired");
      return NextResponse.json(
        { error: "Telegram data expired" },
        { status: 401 },
      );
    }

    const userData = params.get("user");
    console.log("👤 userData:", userData);

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

    let primaryUserId: number;

    try {
      const savedUser = await prisma.user.upsert({
        where: { telegramId: user.id },
        update: {
          firstName: user.first_name || null,
          lastName: user.last_name || null,
          username: user.username || null,
          updatedAt: new Date(),
        },
        create: {
          telegramId: user.id,
          username: user.username || null,
          firstName: user.first_name || null,
          lastName: user.last_name || null,
        },
        select: { id: true },
      });

      primaryUserId = savedUser.id;
      console.log("✅ User saved to database. Primary ID:", primaryUserId);
    } catch (dbError) {
      console.error("❌ Database error: Could not upsert user!", dbError);
      console.error("Full error details:", JSON.stringify(dbError, null, 2));
      return NextResponse.json(
        { error: "Internal Server Error: Database failure" },
        { status: 500 },
      );
    }

    await setSessionCookie({
      userId: primaryUserId,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      isAdmin,
    });

    console.log("✅ Session cookie set with PK:", primaryUserId);

    return NextResponse.json({
      success: true,
      user: { ...user, isAdmin },
    });
  } catch (error) {
    console.error("❌ Validation error:", error);
    console.error(
      "Full error stack:",
      error instanceof Error ? error.stack : error,
    );
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
