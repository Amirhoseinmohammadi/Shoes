import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json(
        { error: "لطفاً وارد سیستم شوید" },
        { status: 401 },
      );

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: { include: { variants: { include: { images: true } } } },
      },
    });

    return NextResponse.json(cartItems, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
      },
    });
  } catch (err) {
    console.error("GET /api/cart error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت سبد خرید" },
      { status: 500 },
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json(
        { error: "لطفاً وارد سیستم شوید" },
        { status: 401 },
      );

    const { productId, quantity, color } = await req.json();
    if (!productId || !quantity)
      return NextResponse.json(
        { error: "productId و quantity الزامی هستند" },
        { status: 400 },
      );

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    });
    if (!product)
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
    if (!product.isActive)
      return NextResponse.json({ error: "محصول غیرفعال است" }, { status: 400 });

    const existing = await prisma.cartItem.findFirst({
      where: { userId, productId, color: color || null },
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: {
          product: { include: { variants: { include: { images: true } } } },
        },
      });
      return NextResponse.json(updated);
    }

    const newItem = await prisma.cartItem.create({
      data: { userId, productId, quantity, color: color || null },
      include: {
        product: { include: { variants: { include: { images: true } } } },
      },
    });

    return NextResponse.json(newItem);
  } catch (err) {
    console.error("POST /api/cart error:", err);
    return NextResponse.json(
      { error: "خطا در افزودن به سبد خرید" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json(
        { error: "لطفاً وارد سیستم شوید" },
        { status: 401 },
      );

    const { cartItemId, quantity } = await req.json();
    const itemId = Number(cartItemId);
    const itemQuantity = Number(quantity);

    if (
      !cartItemId ||
      quantity == null ||
      isNaN(itemId) ||
      isNaN(itemQuantity)
    ) {
      return NextResponse.json(
        { error: "cartItemId یا quantity نامعتبر است" },
        { status: 400 },
      );
    }
    if (itemQuantity <= 0)
      return NextResponse.json(
        { error: "تعداد باید بیشتر از 0 باشد" },
        { status: 400 },
      );

    const existingItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });
    if (!existingItem)
      return NextResponse.json(
        { error: "آیتم سبد خرید یافت نشد" },
        { status: 404 },
      );
    if (existingItem.userId !== userId)
      return NextResponse.json(
        { error: "شما دسترسی به این آیتم ندارید" },
        { status: 403 },
      );

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: itemQuantity },
      include: {
        product: { include: { variants: { include: { images: true } } } },
      },
    });

    return NextResponse.json(updatedItem);
  } catch (err) {
    console.error("PATCH /api/cart error:", err);
    return NextResponse.json(
      { error: "خطا در بروزرسانی سبد خرید" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json(
        { error: "لطفاً وارد سیستم شوید" },
        { status: 401 },
      );

    const { searchParams } = new URL(req.url);
    const cartItemIdParam = searchParams.get("id");
    const cartItemId = Number(cartItemIdParam);
    if (!cartItemIdParam || isNaN(cartItemId))
      return NextResponse.json(
        { error: "شناسه آیتم نامعتبر است" },
        { status: 400 },
      );

    const existingItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });
    if (!existingItem)
      return NextResponse.json(
        { error: "آیتم سبد خرید یافت نشد" },
        { status: 404 },
      );
    if (existingItem.userId !== userId)
      return NextResponse.json(
        { error: "شما دسترسی به این آیتم ندارید" },
        { status: 403 },
      );

    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return NextResponse.json({ success: true, message: "آیتم حذف شد" });
  } catch (err) {
    console.error("DELETE /api/cart error:", err);
    return NextResponse.json(
      { error: "خطا در حذف از سبد خرید" },
      { status: 500 },
    );
  }
}
