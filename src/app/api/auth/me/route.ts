import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromCookie } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const token = getTokenFromCookie(cookieHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, error: "لطفاً وارد شوید" },
        { status: 401 },
      );
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "توکن نامعتبر است" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "کاربر یافت نشد" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error("❌ خطا در دریافت اطلاعات کاربر:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت اطلاعات" },
      { status: 500 },
    );
  }
}
