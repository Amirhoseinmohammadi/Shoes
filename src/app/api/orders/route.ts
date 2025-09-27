import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DEFAULT_USER_ID = 1;
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId")) || DEFAULT_USER_ID;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, items } = body;

  const order = await prisma.order.create({
    data: {
      userId,
      status: "CONFIRMED",
      items: {
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          size: item.size,
        })),
      },
    },
    include: {
      items: { include: { product: true } },
    },
  });

  return NextResponse.json(order);
}
