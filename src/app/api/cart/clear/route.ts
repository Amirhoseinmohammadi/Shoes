import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DEFAULT_USER_ID = 1;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || DEFAULT_USER_ID;

    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/cart/clear error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 },
    );
  }
}
