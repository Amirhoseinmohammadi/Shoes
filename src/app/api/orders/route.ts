"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_TELEGRAM_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

interface OrderItemInput {
  productId: number;
  quantity?: number;
  color?: string | null;
  size?: string | null;
}

interface OrderRequestBody {
  items: OrderItemInput[];
  customerName: string;
  customerPhone: string;
  totalPrice?: number;
  telegramData?: any;
}

export async function GET(req: NextRequest) {
  try {
    const telegramId = req.nextUrl.searchParams.get("telegramId");
    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: "telegramId الزامی است" },
        { status: 400 },
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        telegramData: {
          path: ["id"],
          equals: Number(telegramId),
        },
      },
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
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت سفارش‌ها" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: OrderRequestBody = await req.json();
    const { items, customerName, customerPhone, totalPrice, telegramData } =
      body;

    if (!items || !Array.isArray(items) || items.length === 0)
      return NextResponse.json(
        { success: false, error: "لیست محصولات الزامی است" },
        { status: 400 },
      );

    if (!customerName?.trim())
      return NextResponse.json(
        { success: false, error: "نام مشتری الزامی است" },
        { status: 400 },
      );

    if (!customerPhone?.trim())
      return NextResponse.json(
        { success: false, error: "شماره تماس الزامی است" },
        { status: 400 },
      );

    const productIds = items.map((i) => i.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        isActive: true,
        stock: true,
      },
    });

    if (products.length !== productIds.length)
      return NextResponse.json(
        { success: false, error: "برخی محصولات یافت نشدند" },
        { status: 400 },
      );

    const productsMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      const product = productsMap.get(item.productId)!;
      if (!product.isActive)
        return NextResponse.json(
          { success: false, error: `محصول ${product.name} غیرفعال است` },
          { status: 400 },
        );
      if (product.stock < (item.quantity || 1))
        return NextResponse.json(
          {
            success: false,
            error: `موجودی محصول ${product.name} کافی نیست (موجودی: ${product.stock})`,
          },
          { status: 400 },
        );
    }

    const itemsWithPrice = items.map((item) => {
      const product = productsMap.get(item.productId)!;
      return {
        productId: item.productId,
        quantity: item.quantity || 1,
        price: product.price,
        color: item.color || null,
        size: item.size || null,
      };
    });

    const calculatedTotal = itemsWithPrice.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );

    const order = await prisma.$transaction(async (tx) => {
      for (const item of itemsWithPrice) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const created = await tx.order.create({
        data: {
          status: "PENDING",
          total: totalPrice || calculatedTotal,
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

    if (ADMIN_TELEGRAM_ID && BOT_TOKEN) {
      try {
        const itemsList = order.items
          .map((item) => `• ${item.product.name} - ${item.quantity} عدد`)
          .join("\n");

        const message = `
✅ سفارش جدید!
🆔 کد پیگیری: ${order.trackingCode}
👤 مشتری: ${customerName}
📞 تماس: ${customerPhone}
💰 مبلغ: ${(totalPrice || calculatedTotal).toLocaleString()} تومان
📦 محصولات:
${itemsList}
        `.trim();

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: ADMIN_TELEGRAM_ID, text: message }),
        });
      } catch (err) {
        console.error("❌ خطا در ارسال پیام به ادمین:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "سفارش با موفقیت ثبت شد",
      order,
      trackingCode: order.trackingCode,
      orderId: order.id,
    });
  } catch (error: any) {
    console.error("❌ Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطا در ثبت سفارش",
        message: error.message || "خطای نامشخص",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
