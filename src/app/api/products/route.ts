import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const products = await prisma.product.findMany();
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, brand, price, image, variants } = body;

  const product = await prisma.product.create({
    data: {
      name,
      brand,
      price,
      image,
      variants: {
        create: variants.map((v: any) => ({
          color: v.color,
          images: { create: v.images.map((url: string) => ({ url })) },
          sizes: {
            create: v.sizes.map((s: any) => ({ size: s.size, stock: s.stock })),
          },
        })),
      },
    },
    include: { variants: { include: { images: true, sizes: true } } },
  });

  return NextResponse.json(product);
}
