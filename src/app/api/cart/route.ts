import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/apiResponse";

async function requireSessionAuth(): Promise<number | null> {
  const session = await getSession();
  return typeof session?.userId === "number" ? session.userId : null;
}

export async function GET() {
  try {
    const userId = await requireSessionAuth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            variants: { include: { images: true } },
          },
        },
        size: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ cartItems });
  } catch (err) {
    console.error("GET /api/cart error:", err);
    return errorResponse("خطا در دریافت سبد خرید", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireSessionAuth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const { productId, quantity, color, sizeId } = await req.json();

    // Basic validation
    if (!productId || quantity <= 0 || quantity > 1000) {
      return errorResponse("داده نامعتبر", 400);
    }

    // Verify product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    });

    if (!product || !product.isActive) {
      return errorResponse("محصول نامعتبر یا غیرفعال", 400);
    }

    // Transaction with stock validation
    await prisma.$transaction(async (tx) => {
      const existing = await tx.cartItem.findFirst({
        where: {
          userId,
          productId,
          color: color || null,
          sizeId: sizeId || null,
        },
      });

      // Determine new total quantity
      const newQuantity = existing ? existing.quantity + quantity : quantity;

      // If sizeId specified, ensure stock is sufficient
      if (sizeId) {
        const sizeRecord = await tx.size.findUnique({
          where: { id: sizeId },
          select: { stock: true },
        });
        if (!sizeRecord) {
          throw new Error("اندازه مشخص شده وجود ندارد");
        }
        if (newQuantity > sizeRecord.stock) {
          throw new Error(`موجودی کافی برای سایز موردنظر نیست. حداکثر موجودی: ${sizeRecord.stock}`);
        }
      }

      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: newQuantity },
        });
      } else {
        await tx.cartItem.create({
          data: { userId, productId, quantity, color, sizeId },
        });
      }
    });

    // Return updated cart
    return successResponse(await GET());


  } catch (err: any) {
    console.error("POST /api/cart error:", err);
    return errorResponse(err.message || "خطا", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await requireSessionAuth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const { cartItemId, quantity } = await req.json();

    // Verify ownership of the cart item
    const existingItem = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
    if (!existingItem || existingItem.userId !== userId) {
      return errorResponse("Forbidden - cart item does not belong to user", 403);
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
    } else {
      // Verify stock if size is associated with this cart item
      if (existingItem.sizeId) {
        const sizeRecord = await prisma.size.findUnique({
          where: { id: existingItem.sizeId },
          select: { stock: true },
        });
        if (!sizeRecord) {
          return errorResponse("اندازه مشخص شده وجود ندارد", 400);
        }
        if (quantity > sizeRecord.stock) {
          return errorResponse(`موجودی کافی برای سایز موردنظر نیست. حداکثر موجودی: ${sizeRecord.stock}`, 400);
        }
      }
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      });
    }

    return successResponse(await GET());
  } catch (err) {
    console.error("PATCH /api/cart error:", err);
    return errorResponse("خطا در بروزرسانی", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireSessionAuth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) {
      return NextResponse.json(
        { error: "شناسه نامعتبر", success: false },
        { status: 400 },
      );
    }

    // Verify ownership before deletion
    const itemToDelete = await prisma.cartItem.findUnique({ where: { id } });
    if (!itemToDelete || itemToDelete.userId !== userId) {
      return errorResponse("Forbidden - cart item does not belong to user", 403);
    }
    await prisma.cartItem.delete({ where: { id } });

    return successResponse(await GET());
  } catch (err) {
    console.error("DELETE /api/cart error:", err);
    return errorResponse("خطا در حذف", 500);
  }
}
