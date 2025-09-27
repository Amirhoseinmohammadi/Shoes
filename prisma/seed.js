const { PrismaClient } = require("@prisma/client");
const shoesData = require("../src/components/Products/shoesData");

const prisma = new PrismaClient();

async function main() {
  // ایجاد کاربر پیش‌فرض بدون مشخص کردن id
  await prisma.user.create({
    data: {
      username: "defaultuser",
    },
  });

  // اضافه کردن محصولات و جزئیات آن‌ها
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
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
