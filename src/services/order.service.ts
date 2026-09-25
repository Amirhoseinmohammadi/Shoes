import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export interface CreateOrderInput {
  userId: number;
  customerName: string;
  customerPhone: string;
  address?: string;
  notes?: string;
  items: {
    productId: number;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
  }[];
}

export const orderService = {
  async createOrder(data: CreateOrderInput) {
    const total = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const trackingCode = `TRK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return prisma.order.create({
      data: {
        userId: data.userId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        address: data.address,
        notes: data.notes,
        total,
        trackingCode,
        status: OrderStatus.PENDING,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            color: item.color,
            size: item.size,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  },

  async getUserOrders(userId: number) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getOrderById(id: number) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  },

  async getAllOrders(params?: { status?: OrderStatus; limit?: number; offset?: number }) {
    const where: Record<string, unknown> = {};
    if (params?.status) {
      where.status = params.status;
    }

    return prisma.order.findMany({
      where,
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: params?.limit,
      skip: params?.offset,
    });
  },

  async updateOrderStatus(id: number, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  },

  async getRecentOrders(limit = 5) {
    return prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  },
};
