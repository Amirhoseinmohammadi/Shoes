import { prisma } from "@/lib/prisma";

export interface AddToCartInput {
  userId: number;
  productId: number;
  quantity?: number;
  color?: string;
  sizeId?: number;
}

export const cartService = {
  async getCart(userId: number) {
    return prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            variants: {
              include: {
                images: true,
                sizes: true,
              },
            },
          },
        },
        size: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async addToCart(data: AddToCartInput) {
    const quantity = data.quantity ?? 1;

    // Check if item already exists in cart for this user
    const existing = await prisma.cartItem.findFirst({
      where: {
        userId: data.userId,
        productId: data.productId,
        color: data.color ?? null,
        sizeId: data.sizeId ?? null,
      },
    });

    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: {
          product: true,
          size: true,
        },
      });
    }

    return prisma.cartItem.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        quantity,
        color: data.color ?? null,
        sizeId: data.sizeId ?? null,
      },
      include: {
        product: true,
        size: true,
      },
    });
  },

  async updateQuantity(cartItemId: number, userId: number, quantity: number) {
    if (quantity <= 0) {
      return this.removeFromCart(cartItemId, userId);
    }

    return prisma.cartItem.updateMany({
      where: {
        id: cartItemId,
        userId,
      },
      data: { quantity },
    });
  },

  async removeFromCart(cartItemId: number, userId: number) {
    return prisma.cartItem.deleteMany({
      where: {
        id: cartItemId,
        userId,
      },
    });
  },

  async clearCart(userId: number) {
    return prisma.cartItem.deleteMany({
      where: { userId },
    });
  },
};
