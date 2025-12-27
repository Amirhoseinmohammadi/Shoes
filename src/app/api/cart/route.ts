import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function requireSessionAuth(): Promise<number | null> {
  const session = await getSession();
  return typeof session?.userId === "number" ? session.userId : null;
}

export async function GET() {
  try {
    const userId = await requireSessionAuth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 },
      );
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true,
            variants: { include: { images: true } },
          },
        },
        size: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, cartItems });
  } catch (err) {
    console.error("GET /api/cart error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت سبد خرید", success: false },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireSessionAuth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 },
      );
    }

    const { productId, quantity, color, sizeId } = await req.json();

    if (!productId || quantity <= 0 || quantity > 1000) {
      return NextResponse.json(
        { error: "داده نامعتبر", success: false },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: "محصول نامعتبر یا غیرفعال", success: false },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.cartItem.findFirst({
        where: {
          userId,
          productId,
          color: color || null,
          sizeId: sizeId || null,
        },
      });

      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + quantity },
        });
      } else {
        await tx.cartItem.create({
          data: { userId, productId, quantity, color, sizeId },
        });
      }
    });

    return GET();
  } catch (err: any) {
    console.error("POST /api/cart error:", err);
    return NextResponse.json(
      { error: err.message || "خطا", success: false },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await requireSessionAuth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 },
      );
    }

    const { cartItemId, quantity } = await req.json();

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      });
    }

    return GET();
  } catch (err) {
    console.error("PATCH /api/cart error:", err);
    return NextResponse.json(
      { error: "خطا در بروزرسانی", success: false },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireSessionAuth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 },
      );
    }

    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) {
      return NextResponse.json(
        { error: "شناسه نامعتبر", success: false },
        { status: 400 },
      );
    }

    await prisma.cartItem.delete({ where: { id } });

    return GET();
  } catch (err) {
    console.error("DELETE /api/cart error:", err);
    return NextResponse.json(
      { error: "خطا در حذف", success: false },
      { status: 500 },
    );
  }
}
