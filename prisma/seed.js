import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import shoesData from "../src/components/Products/shoesData.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding products only (no users)...");

  for (const product of shoesData) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {
        brand: product.brand,
        price: product.price,
        description: product.description || null,
        isActive: true,
      },
      create: {
        name: product.name,
        brand: product.brand,
        price: product.price,
        description: product.description || null,
        isActive: true,
        variants: {
          create: product.variants.map((variant) => ({
            color: variant.color,
            images: {
              create: variant.images.map((url) => ({ url })),
            },
            sizes: {
              create: variant.sizes.map((size) => ({
                size: size.size,
                stock: size.stock,
              })),
            },
          })),
        },
      },
    });

    console.log(`✅ Product seeded: ${product.name}`);
  }

  console.log("🎉 Product seeding finished.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
