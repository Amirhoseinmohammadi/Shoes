import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: { variants: { include: { images: true, sizes: true } } },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(product, {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
        },
      });
    }

    const products = await prisma.product.findMany({
      include: { variants: { include: { images: true, sizes: true } } },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, brand, price, image, variants } = body;

    if (!name || !brand || !price || !variants) {
      return NextResponse.json({ error: "Data missing" }, { status: 400 });
    }

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
              create: v.sizes.map((s: any) => ({
                size: s.size,
                stock: s.stock,
              })),
            },
          })),
        },
      },
      include: { variants: { include: { images: true, sizes: true } } },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
