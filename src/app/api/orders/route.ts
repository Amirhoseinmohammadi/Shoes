import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const ADMIN_TELEGRAM_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function requireSessionAuth(): Promise<number | null> {
  const session = await getSession();

  if (session && typeof session.userId === "number") {
    return session.userId;
  }

  return null;
}

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
}

export async function GET(req: NextRequest) {
  try {
    const userId = await requireSessionAuth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - لطفا وارد شوید" },
        { status: 401 },
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
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
      take: 50,
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("❌ GET /api/orders error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطا در دریافت سفارشات",
      },
      { status: 500 },
    );
  }
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

    const body: OrderRequestBody = await req.json();
    const { items, customerName, customerPhone } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "لیست محصولات الزامی است" },
        { status: 400 },
      );
    }

    if (items.length > 50) {
      return NextResponse.json(
        { success: false, error: "حداکثر 50 محصول در سفارش" },
        { status: 400 },
      );
    }

    for (const item of items) {
      if (!item.productId || typeof item.productId !== "number") {
        return NextResponse.json(
          { success: false, error: "شناسه محصول نامعتبر است" },
          { status: 400 },
        );
      }

      const quantity = item.quantity || 1;
      if (typeof quantity !== "number" || quantity <= 0 || quantity > 100) {
        return NextResponse.json(
          { success: false, error: "تعداد نامعتبر است (1-100)" },
          { status: 400 },
        );
      }
    }

    if (!customerName?.trim() || customerName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "نام مشتری باید حداقل 2 کاراکتر باشد" },
        { status: 400 },
      );
    }

    if (customerName.trim().length > 100) {
      return NextResponse.json(
        { success: false, error: "نام مشتری خیلی طولانی است" },
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

    const productIds = items.map((i) => i.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        brand: true,
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { success: false, error: "بعضی محصولات یافت نشد" },
        { status: 404 },
      );
    }

    const productsMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      const product = productsMap.get(item.productId);

      if (!product) {
        return NextResponse.json(
          { success: false, error: `محصول ${item.productId} یافت نشد` },
          { status: 404 },
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          { success: false, error: `محصول ${product.name} غیرفعال است` },
          { status: 400 },
        );
      }

      if (!product.price || product.price <= 0) {
        return NextResponse.json(
          { success: false, error: "قیمت محصول نامعتبر است" },
          { status: 500 },
        );
      }
    }

    const itemsWithPrice = items.map((item) => {
      const product = productsMap.get(item.productId)!;
      const quantity = item.quantity || 1;

      return {
        productId: item.productId,
        quantity,
        price: product.price,
        color: item.color?.trim() || null,
        size: item.size?.trim() || null,
      };
    });

    const calculatedTotal = itemsWithPrice.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          status: "PENDING",
          total: calculatedTotal,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          userId: userId,
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
          .map(
            (i) =>
              `• ${i.product.name} (${i.quantity}x) - ${(i.price * i.quantity).toLocaleString()} ت`,
          )
          .join("\n");

        const message = `
✅ سفارش جدید!
🆔 کد: ${order.trackingCode}
👤 نام: ${customerName}
📞 تماس: ${customerPhone}
💰 مبلغ: ${calculatedTotal.toLocaleString()} تومان
📦 محصولات:
${itemsList}
        `.trim();

        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: ADMIN_TELEGRAM_ID, text: message }),
        }).catch((err) => {
          console.error("⚠️ Telegram notification failed:", err);
        });
      } catch (err) {
        console.error("⚠️ Telegram error:", err);
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
    console.error("❌ POST /api/orders error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطا در ثبت سفارش",
        message: error.message || "خطای نامشخص",
      },
      { status: 500 },
    );
  }
}
