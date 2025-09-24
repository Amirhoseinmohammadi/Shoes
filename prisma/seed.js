const { PrismaClient } = require("@prisma/client");
const shoesData = require("../src/components/Products/shoesData");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  console.log("👤 Creating default user...");
  await prisma.user.create({
    data: {
      id: 1, // Using a specific ID for consistency
      username: "defaultuser",
    },
  });
  console.log("👤 Default user created.");

  console.log("👟 Creating products...");
  for (const product of shoesData) {
    const createdProduct = await prisma.product.create({
      data: {
        name: product.name,
        brand: product.brand,
        price: product.price,
        description: product.description || null,
        variants: {
          create: product.variants.map((variant) => ({
            color: variant.color,
            images: {
              create: variant.images.map((url) => ({
                url: url,
              })),
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
    console.log(`   - Created product: ${createdProduct.name}`);
  }

  console.log("✅ Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
