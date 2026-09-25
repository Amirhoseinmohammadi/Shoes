import { prisma } from "@/lib/prisma";

export const userService = {
  async getUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            orders: true,
            cartItems: true,
          },
        },
      },
    });
  },

  async getUserByTelegramId(telegramId: string) {
    return prisma.user.findUnique({
      where: { telegramId },
    });
  },

  async getAllUsers(params?: { search?: string; limit?: number; offset?: number }) {
    const where: Record<string, unknown> = {};

    if (params?.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: "insensitive" } },
        { lastName: { contains: params.search, mode: "insensitive" } },
        { username: { contains: params.search, mode: "insensitive" } },
        { phone: { contains: params.search, mode: "insensitive" } },
      ];
    }

    return prisma.user.findMany({
      where,
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: params?.limit,
      skip: params?.offset,
    });
  },

  async updateUser(
    id: number,
    data: {
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
      username?: string | null;
    },
  ) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  async getUserCount() {
    return prisma.user.count();
  },
};
