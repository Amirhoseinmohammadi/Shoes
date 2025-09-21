import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../prisma/client";

export async function GET(req: NextRequest) {
  try {
    const shoes = await prisma.product.findMany({
      // Add this 'include' block to fetch related data
      include: {
        variants: {
          include: {
            images: true, // This tells Prisma to include the images for each variant
            sizes: true, // It's also a good idea to include the sizes
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
