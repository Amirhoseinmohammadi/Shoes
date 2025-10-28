import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// اینجا آیدی کاربری که میخوای حذف کنی یا آرایه‌ای از آیدی‌ها
const userIdsToDelete = [1, 3]; // مثال

async function main() {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // ابتدا حذف سفارش‌های کاربران
      await tx.order.deleteMany({
        where: { userId: { in: userIdsToDelete } },
      });

      // سپس حذف کاربران
      const deleted = await tx.user.deleteMany({
        where: { id: { in: userIdsToDelete } },
      });

      return deleted;
    });

    console.log("Deleted users count:", result.count);
  } catch (error) {
    console.error("Error deleting users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
