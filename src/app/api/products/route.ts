import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const products = await prisma.product.findMany();
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, brand, price, image, color, size } = body;

  const product = await prisma.product.create({
    data: { name, brand, price, image, color, size },
  });

  return NextResponse.json(product);
}
