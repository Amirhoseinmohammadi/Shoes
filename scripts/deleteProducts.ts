// scripts/deleteProducts.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // اینجا آی‌دی‌هایی که می‌خوای پاک بشن رو بزن
    await prisma.product.deleteMany({
      where: { id: { in: [1, 2] } },
    });

    console.log("✅ محصولات حذف شدند!");
  } catch (error) {
    console.error("❌ خطا در حذف محصول:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
