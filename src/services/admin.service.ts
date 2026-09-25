import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export const adminService = {
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      activeProducts,
      totalOrders,
      todayOrders,
      totalUsers,
      revenueResult,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({
        where: {
          createdAt: { gte: today },
        },
      }),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
        where: {
          status: { not: OrderStatus.CANCELLED },
        },
      }),
    ]);

    const totalRevenue = revenueResult._sum.total || 0;

    return {
      totalProducts,
      activeProducts,
      totalOrders,
      todayOrders,
      totalUsers,
      totalRevenue,
    };
  },

  async getRecentActivities(limit = 6) {
    const [recentOrders, recentUsers] = await Promise.all([
      prisma.order.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              username: true,
            },
          },
        },
      }),
      prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      recentOrders,
      recentUsers,
    };
  },
};
