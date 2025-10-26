import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "YOUR_STRONG_FALLBACK_SECRET";
const ADMIN_TELEGRAM_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

function getRawUserIdFromToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  if (!token) {
    return null;
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (decoded.userId === undefined || decoded.userId === null) {
      return null;
    }

    return String(decoded.userId);
  } catch (error) {
    console.error("❌ JWT Validation Error:", error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const rawUserId = getRawUserIdFromToken(req);

    if (!rawUserId) {
      return NextResponse.json(
        { success: false, error: "لطفاً وارد سیستم شوید" },
        { status: 401 },
      );
    }

    const userId = parseInt(rawUserId, 10);

    if (isNaN(userId)) {
      console.error("❌ userId معتبر (عددی) نیست:", rawUserId);
      return NextResponse.json(
        { success: false, error: "توکن نامعتبر است (شناسه کاربری عددی نیست)" },
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
    console.error("❌ Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت سفارشات" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawUserId = getRawUserIdFromToken(req);

    if (!rawUserId) {
      console.error("❌ کاربر لاگین نیست");
      return NextResponse.json(
        { success: false, error: "لطفاً وارد سیستم شوید" },
        { status: 401 },
      );
    }

    const userId = parseInt(rawUserId, 10);

    if (isNaN(userId)) {
      console.error("❌ userId معتبر (عددی) نیست:", rawUserId);
      return NextResponse.json(
        { success: false, error: "توکن نامعتبر است (شناسه کاربری عددی نیست)" },
        { status: 401 },
      );
    }

    const body = await req.json();
    console.log("📦 داده‌های دریافتی:", JSON.stringify(body, null, 2));

    const { items, customerName, customerPhone, totalPrice, telegramData } =
      body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("❌ آیتم‌ها خالی هستند");
      return NextResponse.json(
        { success: false, error: "لیست محصولات الزامی است" },
        { status: 400 },
      );
    }

    if (!customerName?.trim()) {
      console.error("❌ نام مشتری خالی است");
      return NextResponse.json(
        { success: false, error: "نام مشتری الزامی است" },
        { status: 400 },
      );
    }

    if (!customerPhone?.trim()) {
      console.error("❌ شماره تماس خالی است");
      return NextResponse.json(
        { success: false, error: "شماره تماس الزامی است" },
        { status: 400 },
      );
    }

    const productIds = items.map((i: any) => i.productId);
    console.log("🔍 بررسی محصولات:", productIds);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, isActive: true },
    });

    console.log("✅ محصولات یافت شده:", products.length);

    if (products.length !== productIds.length) {
      console.error("❌ برخی محصولات یافت نشدند");
      return NextResponse.json(
        { success: false, error: "برخی محصولات یافت نشدند" },
        { status: 400 },
      );
    }

    const productsMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      const product = productsMap.get(item.productId);
      if (!product) {
        console.error(`❌ محصول ${item.productId} یافت نشد`);
        return NextResponse.json(
          {
            success: false,
            error: `محصول با شناسه ${item.productId} یافت نشد`,
          },
          { status: 400 },
        );
      }
      if (!product.isActive) {
        console.error(`❌ محصول ${product.name} غیرفعال است`);
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

    console.log("💰 قیمت محاسبه شده:", calculatedTotal);
    console.log("💰 قیمت ارسالی:", totalPrice);

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
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

    console.log("✅ سفارش ثبت شد:", order.id, "کد پیگیری:", order.trackingCode);

    if (ADMIN_TELEGRAM_ID && BOT_TOKEN) {
      const message = `
✅ سفارش جدید!
🆔 کد پیگیری: ${order.trackingCode}
👤 مشتری: ${customerName}
📞 تماس: ${customerPhone}
💰 مبلغ: ${(totalPrice || calculatedTotal).toLocaleString()} تومان
📦 تعداد: ${items.length} محصول
      `.trim();

      fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${ADMIN_TELEGRAM_ID}&text=${encodeURIComponent(message)}`,
      ).catch((err) => console.error("❌ خطا در ارسال پیام به ادمین:", err));
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
    console.error("Stack:", error.stack);

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
