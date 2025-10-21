const { PrismaClient } = require("@prisma/client");
const shoesData = require("../src/components/Products/shoesData");

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { username: "defaultuser" },
    update: {},
    create: { username: "defaultuser" },
  });

  for (const product of shoesData) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: {
        name: product.name,
        brand: product.brand,
        price: product.price,
        description: product.description || null,
        variants: {
          create: product.variants.map((variant) => ({
            color: variant.color,
            images: { create: variant.images.map((url) => ({ url })) },
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
    console.log("Product upserted");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
