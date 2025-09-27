import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.product.deleteMany({
      where: { id: { in: [1, 2] } },
    });
  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

main();
