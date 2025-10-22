import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "لطفاً وارد سیستم شوید" },
        { status: 401 },
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, brand: true, price: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "خطا در دریافت سفارشات" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "لطفاً وارد سیستم شوید" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { items, customerName, customerPhone, totalPrice, telegramData } =
      body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "لیست محصولات الزامی است" },
        { status: 400 },
      );
    }

    if (!customerName?.trim() || !customerPhone?.trim()) {
      return NextResponse.json(
        { error: "نام و شماره تماس الزامی است" },
        { status: 400 },
      );
    }

    // بررسی موجودیت و فعال بودن محصولات
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, isActive: true },
      });

      if (!product)
        return NextResponse.json(
          { error: `محصول با شناسه ${item.productId} یافت نشد` },
          { status: 400 },
        );
      if (!product.isActive)
        return NextResponse.json(
          { error: `محصول ${product.name} غیرفعال است` },
          { status: 400 },
        );
    }

    const calculatedTotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          status: "PENDING",
          total: totalPrice || calculatedTotal,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          telegramData: telegramData ? JSON.stringify(telegramData) : null,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              color: item.color || null,
              size: item.size || null,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, brand: true, price: true },
              },
            },
          },
        },
      });
      return created;
    });

    const trackingCode = `TRK${order.id.toString().padStart(6, "0")}`;
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { trackingCode },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, brand: true, price: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "سفارش با موفقیت ثبت شد",
      order: updatedOrder,
      trackingCode,
      orderId: updatedOrder.id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطا در ثبت سفارش",
        message: "خطا در ثبت سفارش در سیستم",
      },
      { status: 500 },
    );
  }
}
