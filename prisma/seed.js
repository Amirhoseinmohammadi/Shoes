const { PrismaClient } = require("@prisma/client");
const shoesData = require("../src/components/Products/shoesData");

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      id: 1,
      username: "defaultuser",
    },
  });

  for (const product of shoesData) {
    await prisma.product.create({
      data: {
        name: product.name,
        brand: product.brand,
        price: product.price,
        description: product.description || null,
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
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
