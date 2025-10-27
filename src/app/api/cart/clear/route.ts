import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "لطفاً وارد سیستم شوید" },
        { status: 401 },
      );
    }

    const userId = parseInt(session.user.id);

    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      message: "سبد خرید با موفقیت پاک شد",
    });
  } catch (err: any) {
    console.error("POST /api/cart/clear error:", err);
    return NextResponse.json(
      { error: "خطا در پاک کردن سبد خرید" },
      { status: 500 },
    );
  }
}
