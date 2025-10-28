import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const telegramId = body.telegramId;

    if (!telegramId) {
      return NextResponse.json(
        { error: "telegramId الزامی است" },
        { status: 400 },
      );
    }

    const deleted = await prisma.cartItem.deleteMany({
      where: {
        user: {
          telegramId: Number(telegramId),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `سبد خرید با موفقیت پاک شد (${deleted.count} آیتم حذف شد)`,
    });
  } catch (err: any) {
    console.error("POST /api/cart/clear error:", err);
    return NextResponse.json(
      { error: "خطا در پاک کردن سبد خرید" },
      { status: 500 },
    );
  }
}
