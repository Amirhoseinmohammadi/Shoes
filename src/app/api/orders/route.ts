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
        { success: false, error: "لطفاً وارد سیستم شوید" },
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

    return NextResponse.json(orders, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت سفارشات" },
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
        { success: false, error: "لطفاً وارد سیستم شوید" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { items, customerName, customerPhone, telegramData } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "لیست محصولات الزامی است" },
        { status: 400 },
      );
    }

    if (!customerName?.trim() || !customerPhone?.trim()) {
      return NextResponse.json(
        { success: false, error: "نام و شماره تماس الزامی است" },
        { status: 400 },
      );
    }

    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, isActive: true },
    });

    const productsMap = new Map(products.map((p) => [p.id, p]));
    for (const item of items) {
      const product = productsMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          {
            success: false,
            error: `محصول با شناسه ${item.productId} یافت نشد`,
          },
          { status: 400 },
        );
      }
      if (!product.isActive) {
        return NextResponse.json(
          { success: false, error: `محصول ${product.name} غیرفعال است` },
          { status: 400 },
        );
      }
    }

    const itemsWithPrice = items.map((item: any) => {
      const product = productsMap.get(item.productId)!;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        color: item.color || null,
        size: item.size || null,
      };
    });

    const totalPrice = itemsWithPrice.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          status: "PENDING",
          total: totalPrice,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          telegramData: telegramData ? JSON.stringify(telegramData) : null,
          items: { create: itemsWithPrice },
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

      const trackingCode = `TRK${created.id.toString().padStart(6, "0")}`;
      return tx.order.update({
        where: { id: created.id },
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
    });

    return NextResponse.json({
      success: true,
      message: "سفارش با موفقیت ثبت شد",
      order,
      trackingCode: order.trackingCode,
      orderId: order.id,
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
