import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    console.log("دریافت محصول با ID:", params.id);

    const product = await prisma.product.findUnique({
      where: { id: Number(params.id) },
      include: {
        variants: {
          include: {
            images: true,
            sizes: true,
          },
        },
      },
    });

    console.log("محصول یافت شد:", product);

    if (!product) {
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("خطا در دریافت محصول:", error);
    return NextResponse.json({ error: "خطا در دریافت محصول" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const data = await req.json();

    const updatedProduct = await prisma.$transaction(async (tx) => {
      await tx.variant.deleteMany({
        where: { productId: Number(params.id) },
      });

      const product = await tx.product.update({
        where: { id: Number(params.id) },
        data: {
          name: data.name,
          brand: data.brand,
          description: data.description,
          price: Number(data.price),
          variants: {
            create: data.variants.map((variant: any) => ({
              color: variant.color,
              images: {
                create: variant.images.map((image: any) => ({
                  url: image.url,
                })),
              },
              sizes: {
                create: [{ size: "38", stock: 1 }],
              },
            })),
          },
        },
        include: {
          variants: {
            include: {
              images: true,
              sizes: true,
            },
          },
        },
      });

      return product;
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("خطا در ویرایش محصول:", error);
    return NextResponse.json({ error: "خطا در ویرایش محصول" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.product.delete({
      where: { id: Number(params.id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("خطا در حذف محصول:", error);
    return NextResponse.json({ error: "خطا در حذف محصول" }, { status: 500 });
  }
}
