import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { variants: true },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "خطا در دریافت محصولات" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.name || !data.price) {
      return NextResponse.json(
        { error: "نام و قیمت الزامی است" },
        { status: 400 },
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        brand: data.brand || "",
        description: data.description || "",
        price: Number(data.price),
        image: data.image || null,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "خطا در افزودن محصول" }, { status: 500 });
  }
}
