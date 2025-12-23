import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userIdsToDelete = [1, 3];

async function main() {
  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.order.deleteMany({
        where: { userId: { in: userIdsToDelete } },
      });

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
