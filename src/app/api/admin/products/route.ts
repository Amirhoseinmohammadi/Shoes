import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: {
          include: {
            images: true,
            sizes: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("خطا در دریافت محصولات:", error);
    return NextResponse.json(
      { error: "خطا در دریافت محصولات" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const product = await prisma.product.create({
      data: {
        name: data.name,
        brand: data.brand,
        description: data.description || "",
        price: Number(data.price),
        image: data.image || "",
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

    return NextResponse.json(product);
  } catch (error) {
    console.error("خطا در ایجاد محصول:", error);
    return NextResponse.json({ error: "خطا در ایجاد محصول" }, { status: 500 });
  }
}
