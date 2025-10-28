import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return parseInt(session.user.id);
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
        product: {
          include: {
            variants: { include: { images: true } },
          },
        },
      },
    });

    return NextResponse.json(cartItems);
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

    const { productId, quantity, color, size } = await req.json();
    if (!productId || !quantity)
      return NextResponse.json(
        { error: "productId و quantity الزامی هستند" },
        { status: 400 },
      );

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true, stock: true },
    });

    if (!product)
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
    if (!product.isActive)
      return NextResponse.json({ error: "محصول غیرفعال است" }, { status: 400 });
    if (product.stock < quantity)
      return NextResponse.json(
        { error: `موجودی محصول کافی نیست (موجودی: ${product.stock})` },
        { status: 400 },
      );

    const existing = await prisma.cartItem.findFirst({
      where: { userId, productId, color: color || null, size: size || null },
    });

    const cartItemData = {
      userId,
      productId,
      quantity,
      color: color || null,
      size: size || null,
    };

    const includeProduct = {
      product: { include: { variants: { include: { images: true } } } },
    };

    const result = existing
      ? await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + quantity },
          include: includeProduct,
        })
      : await prisma.cartItem.create({
          data: cartItemData,
          include: includeProduct,
        });

    return NextResponse.json(result);
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
    if (!cartItemId || quantity === undefined)
      return NextResponse.json(
        { error: "cartItemId و quantity الزامی هستند" },
        { status: 400 },
      );
    if (quantity <= 0)
      return NextResponse.json(
        { error: "تعداد باید بیشتر از 0 باشد" },
        { status: 400 },
      );

    const existingItem = await prisma.cartItem.findFirst({
      where: { id: cartItemId, userId },
    });
    if (!existingItem)
      return NextResponse.json(
        { error: "آیتم سبد خرید یافت نشد" },
        { status: 404 },
      );

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
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
    const cartItemId = searchParams.get("id");
    if (!cartItemId)
      return NextResponse.json(
        { error: "شناسه آیتم الزامی است" },
        { status: 400 },
      );

    const cartItemIdNum = parseInt(cartItemId);
    const existingItem = await prisma.cartItem.findFirst({
      where: { id: cartItemIdNum, userId },
    });
    if (!existingItem)
      return NextResponse.json(
        { error: "آیتم سبد خرید یافت نشد" },
        { status: 404 },
      );

    await prisma.cartItem.delete({ where: { id: cartItemIdNum } });

    return NextResponse.json({
      success: true,
      message: "آیتم با موفقیت حذف شد",
    });
  } catch (err) {
    console.error("DELETE /api/cart error:", err);
    return NextResponse.json(
      { error: "خطا در حذف از سبد خرید" },
      { status: 500 },
    );
  }
}
