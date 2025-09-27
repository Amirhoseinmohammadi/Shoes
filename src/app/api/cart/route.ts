import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DEFAULT_USER_ID = 1;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get("userId")) || DEFAULT_USER_ID;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            variants: {
              include: { images: true },
            },
          },
        },
      },
    });

    return NextResponse.json(cartItems);
  } catch (err) {
    console.error("GET /api/cart error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, quantity, color } = body;
    const userId = body.userId || 1;

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: "productId and quantity are required" },
        { status: 400 },
      );
    }

    const existing = await prisma.cartItem.findFirst({
      where: { userId, productId, color },
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { product: true },
      });
      return NextResponse.json(updated);
    }

    const newItem = await prisma.cartItem.create({
      data: { userId, productId, quantity, color },
      include: { product: true },
    });

    return NextResponse.json(newItem);
  } catch (err) {
    console.error("POST /api/cart error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId || quantity === undefined || quantity === null) {
      return NextResponse.json(
        { error: "cartItemId and quantity are required" },
        { status: 400 },
      );
    }

    const itemId = Number(cartItemId);
    const itemQuantity = Number(quantity);

    if (isNaN(itemId) || isNaN(itemQuantity)) {
      return NextResponse.json(
        { error: "Invalid cartItemId or quantity" },
        { status: 400 },
      );
    }

    if (itemQuantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be greater than 0" },
        { status: 400 },
      );
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 },
      );
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: itemQuantity },
      include: { product: true },
    });

    return NextResponse.json(updatedItem);
  } catch (err) {
    console.error("PATCH /api/cart error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cartItemIdParam = searchParams.get("id");

    if (!cartItemIdParam) {
      return NextResponse.json(
        { error: "Cart item ID is required" },
        { status: 400 },
      );
    }

    const cartItemId = Number(cartItemIdParam);

    if (isNaN(cartItemId)) {
      return NextResponse.json(
        { error: "Invalid cart item ID" },
        { status: 400 },
      );
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 },
      );
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/cart error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 },
    );
  }
}
