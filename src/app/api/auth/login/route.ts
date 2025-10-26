import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telegramId, firstName, lastName, username } = body;

    console.log("🔐 درخواست لاگین:", {
      telegramId,
      username,
      firstName,
    });

    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: "Telegram ID الزامی است" },
        { status: 400 },
      );
    }

    const tgId = parseInt(telegramId.toString());

    let user = await prisma.user.findUnique({
      where: { telegramId: tgId },
    });

    if (user) {
      console.log("✅ کاربر موجود یافت شد:", user.id);

      // به‌روزرسانی اطلاعات
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          username: username || user.username,
          updatedAt: new Date(),
        },
      });
    } else {
      console.log("➕ ساخت کاربر جدید");

      user = await prisma.user.create({
        data: {
          telegramId: tgId,
          username: username || `user_${tgId}`,
          firstName: firstName || null,
          lastName: lastName || null,
        },
      });

      console.log("✅ کاربر جدید ساخته شد:", user.id);
    }

    const token = await createToken({
      userId: user.id,
      telegramId: tgId,
      username: user.username || undefined,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
    });

    console.log("✅ JWT Token ساخته شد");

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 روز
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("❌ خطا در لاگین:", error);
    return NextResponse.json(
      { success: false, error: "خطا در لاگین" },
      { status: 500 },
    );
  }
}
