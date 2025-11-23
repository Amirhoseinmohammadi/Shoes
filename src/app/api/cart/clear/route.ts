import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function requireSessionAuth(): Promise<number | null> {
  const session = await getSession();

  if (session && typeof session.userId === "number") {
    return session.userId;
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireSessionAuth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - لطفا وارد شوید" },
        { status: 401 },
      );
    }

    const deleted = await prisma.cartItem.deleteMany({
      where: {
        userId: userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `سبد خرید شما با موفقیت پاک شد (${deleted.count} آیتم حذف شد)`,
      deletedCount: deleted.count,
    });
  } catch (err: any) {
    console.error("POST /api/cart/clear error:", err);
    return NextResponse.json(
      { error: "خطا در پاک کردن سبد خرید" },
      { status: 500 },
    );
  }
}
