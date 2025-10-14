import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🟢 دریافت محصول
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const product = await prisma.product.findUnique({
    where: { id: Number(params.id) },
  });

  if (!product) {
    return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
  }

  return NextResponse.json(product);
}

// ✏️ بروزرسانی محصول
export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const data = await req.json();
  const updated = await prisma.product.update({
    where: { id: Number(params.id) },
    data: {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      image: data.image,
    },
  });

  return NextResponse.json(updated);
}

// ❌ حذف محصول
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  await prisma.product.delete({
    where: { id: Number(params.id) },
  });
  return NextResponse.json({ success: true });
}
