import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function getSessionUserId(req: NextRequest): Promise<number | null> {
  try {
    const userId = req.headers.get("x-session-user-id");
    if (!userId) {
      return null;
    }
    return parseInt(userId, 10);
  } catch {
    return null;
  }
}

async function requireSessionAuth(req: NextRequest): Promise<number | null> {
  const userId = await getSessionUserId(req);

  if (!userId) {
    return null;
  }

  return userId;
}

// --- GET: دریافت سبد خرید ---

export async function GET(req: NextRequest) {
  try {
    const userId = await requireSessionAuth(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - لطفا وارد شوید", success: false },
        { status: 401 },
      );
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            variants: {
              include: {
                images: true,
              },
            },
          },
        },
        // 💡 شامل مدل Size برای دسترسی به stock و نام سایز
        size: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, cartItems });
  } catch (err) {
    console.error("❌ GET /api/cart error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت سبد خرید", success: false },
      { status: 500 },
    );
  }
}

// --- POST: افزودن به سبد خرید ---

export async function POST(req: NextRequest) {
  try {
    const userId = await requireSessionAuth(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - لطفا وارد شوید", success: false },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { productId, quantity, color, sizeId } = body;

    if (!productId || typeof productId !== "number" || productId <= 0) {
      return NextResponse.json(
        { error: "شناسه محصول نامعتبر است", success: false },
        { status: 400 },
      );
    }

    if (!quantity || typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json(
        { error: "تعداد نامعتبر است", success: false },
        { status: 400 },
      );
    }

    if (quantity > 100) {
      return NextResponse.json(
        { error: "حداکثر تعداد 100 است", success: false },
        { status: 400 },
      );
    }

    // 1. کوئری محصول: حذف 'stock' برای رفع خطای کامپایل
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true, price: true, name: true }, // 'stock' حذف شد
    });

    if (!product) {
      return NextResponse.json(
        { error: "محصول یافت نشد", success: false },
        { status: 404 },
      );
    }

    if (!product.isActive) {
      return NextResponse.json(
        { error: "محصول غیرفعال است", success: false },
        { status: 400 },
      );
    }

    // 2. بررسی موجودی بر اساس Size (اگر sizeId ارسال شده باشد)
    let currentStock: number;

    if (sizeId) {
      const sizeData = await prisma.size.findUnique({
        where: { id: sizeId },
        select: { stock: true },
      });

      if (!sizeData) {
        return NextResponse.json(
          { error: "سایز نامعتبر است", success: false },
          { status: 400 },
        );
      }
      currentStock = sizeData.stock;
    } else {
      // برای محصولات بدون سایز، فرض موجودی زیاد
      currentStock = 100000;
    }

    if (currentStock < quantity) {
      return NextResponse.json(
        {
          error: `موجودی ناکافی (موجودی: ${currentStock})`,
          success: false,
        },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // پیدا کردن آیتم قبلی در سبد
      const existing = await tx.cartItem.findFirst({
        where: {
          userId,
          productId,
          color: color || null,
          sizeId: sizeId || null,
        },
        // برای چک موجودی در صورت وجود آیتم، باید Size را Include کنیم
        include: {
          size: {
            select: { stock: true },
          },
        },
      });

      if (existing) {
        const newQuantity = existing.quantity + quantity;

        const stockToCheck = existing.size?.stock ?? 100000;

        if (newQuantity > stockToCheck) {
          throw new Error(
            `موجودی کافی نیست برای تعداد ${newQuantity} (${product.name})`,
          );
        }

        return await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: newQuantity },
          include: {
            product: {
              include: {
                variants: {
                  include: {
                    images: true,
                  },
                },
              },
            },
            size: true,
          },
        });
      }

      // افزودن آیتم جدید
      return await tx.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
          color: color || null,
          sizeId: sizeId || null,
          // 🛑 خط size: sizeName || null, حذف شد تا Type Error رفع شود.
        },
        include: {
          product: {
            include: {
              variants: {
                include: {
                  images: true,
                },
              },
            },
          },
          size: true,
        },
      });
    });

    return NextResponse.json({ success: true, cartItem: result });
  } catch (err: any) {
    console.error("❌ POST /api/cart error:", err);
    return NextResponse.json(
      {
        error: err.message || "خطا در افزودن به سبد خرید",
        success: false,
      },
      { status: 500 },
    );
  }
}

// --- PATCH: به‌روزرسانی سبد خرید ---

export async function PATCH(req: NextRequest) {
  try {
    const userId = await requireSessionAuth(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - لطفا وارد شوید", success: false },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId || typeof cartItemId !== "number") {
      return NextResponse.json(
        { error: "شناسه آیتم نامعتبر است", success: false },
        { status: 400 },
      );
    }

    if (
      quantity !== undefined &&
      (typeof quantity !== "number" || quantity < 0)
    ) {
      return NextResponse.json(
        { error: "تعداد نامعتبر است", success: false },
        { status: 400 },
      );
    }

    // 1. کوئری: شامل مدل Size برای دسترسی به موجودی
    const existingItem = await prisma.cartItem.findFirst({
      where: { id: cartItemId, userId },
      include: {
        size: {
          select: { stock: true },
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "آیتم یافت نشد", success: false },
        { status: 404 },
      );
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
      return NextResponse.json({
        success: true,
        message: "آیتم حذف شد",
      });
    }

    // 2. بررسی موجودی: استفاده از موجودی مدل Size
    const currentStock = existingItem.size?.stock ?? 100000;

    if (quantity > currentStock) {
      return NextResponse.json(
        {
          error: `موجودی ناکافی (موجودی: ${currentStock})`,
          success: false,
        },
        { status: 400 },
      );
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: {
        product: {
          include: {
            variants: {
              include: {
                images: true,
              },
            },
          },
        },
        size: true,
      },
    });

    return NextResponse.json({ success: true, cartItem: updatedItem });
  } catch (err: any) {
    console.error("❌ PATCH /api/cart error:", err);
    return NextResponse.json(
      {
        error: err.message || "خطا در بروزرسانی سبد خرید",
        success: false,
      },
      { status: 500 },
    );
  }
}

// --- DELETE: حذف از سبد خرید ---

export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireSessionAuth(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - لطفا وارد شوید", success: false },
        { status: 401 },
      );
    }

    const url = new URL(req.url);
    const cartItemId = url.searchParams.get("id");

    if (!cartItemId || isNaN(parseInt(cartItemId))) {
      return NextResponse.json(
        { error: "شناسه آیتم نامعتبر است", success: false },
        { status: 400 },
      );
    }

    const id = parseInt(cartItemId, 10);

    const existingItem = await prisma.cartItem.findFirst({
      where: { id, userId },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "آیتم یافت نشد", success: false },
        { status: 404 },
      );
    }

    await prisma.cartItem.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "آیتم حذف شد",
    });
  } catch (err) {
    console.error("❌ DELETE /api/cart error:", err);
    return NextResponse.json(
      { error: "خطا در حذف از سبد خرید", success: false },
      { status: 500 },
    );
  }
}
