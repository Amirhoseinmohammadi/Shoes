import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../prisma/client";

export async function GET(req: NextRequest) {
  try {
    const shoes = await prisma.product.findMany({
      include: {
        variants: {
          include: {
            images: true,
            sizes: true,
          },
        },
      },
    });

    return NextResponse.json(shoes);
  } catch (error) {
    console.error("GET /api/shoes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shoes" },
      { status: 500 },
    );
  }
}
