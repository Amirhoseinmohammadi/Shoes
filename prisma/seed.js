import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TEST_TELEGRAM_ID = BigInt(999999999);

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.user.upsert({
    where: {
      telegramId: TEST_TELEGRAM_ID,
    },
    update: {},
    create: {
      telegramId: TEST_TELEGRAM_ID,
      username: "test_user",
      firstName: "Test",
      lastName: "User",
    },
  });

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
