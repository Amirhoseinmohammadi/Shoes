import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function requireSessionAuth(): Promise<number> {
  const session = await getSession();

  if (!session || typeof session.userId !== "number") {
    throw new Error("UNAUTHORIZED");
  }

  return session.userId;
}

export async function GET() {
  try {
    const userId = await requireSessionAuth();

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                price: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    console.error("❌ GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت سفارشات" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireSessionAuth();

    const body = await req.json();
    const { customerName, customerPhone } = body;

    /* ---------- basic validation ---------- */

    if (!customerName?.trim() || customerName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "نام مشتری نامعتبر است" },
        { status: 400 },
      );
    }

    if (!customerPhone?.trim()) {
      return NextResponse.json(
        { success: false, error: "شماره تماس الزامی است" },
        { status: 400 },
      );
    }

    const phoneRegex = /^(\+98|0)?9\d{9}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      return NextResponse.json(
        { success: false, error: "شماره تماس نامعتبر است" },
        { status: 400 },
      );
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            price: true,
            isActive: true,
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "سبد خرید خالی است" },
        { status: 400 },
      );
    }

    for (const item of cartItems) {
      if (!item.product || !item.product.isActive) {
        return NextResponse.json(
          {
            success: false,
            error: `محصول ${item.product?.name ?? ""} غیرفعال است`,
          },
          { status: 400 },
        );
      }

      if (!item.product.price || item.product.price <= 0) {
        return NextResponse.json(
          { success: false, error: "قیمت محصول نامعتبر است" },
          { status: 500 },
        );
      }
    }

    const itemsWithPrice = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
      color: item.color,
      size: item.sizeId ? String(item.sizeId) : null,
    }));

    const total = itemsWithPrice.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          status: "PENDING",
          total,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
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

      await tx.cartItem.deleteMany({
        where: { userId },
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

    if (ADMIN_TELEGRAM_ID && BOT_TOKEN) {
      const itemsText = order.items
        .map(
          (i) =>
            `• ${i.product.name} (${i.quantity}x) - ${(i.price * i.quantity).toLocaleString()} ت`,
        )
        .join("\n");

      const message = `
✅ سفارش جدید
🆔 ${order.trackingCode}
👤 ${order.customerName}
📞 ${order.customerPhone}
💰 ${order.total.toLocaleString()} تومان

📦 اقلام:
${itemsText}
      `.trim();

      fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: ADMIN_TELEGRAM_ID,
          text: message,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "سفارش با موفقیت ثبت شد",
      order,
      trackingCode: order.trackingCode,
      orderId: order.id,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    console.error("❌ POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در ثبت سفارش" },
      { status: 500 },
    );
  }
}
