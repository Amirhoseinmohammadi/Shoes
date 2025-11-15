import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "@/lib/auth-guard";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = Number(params.id);

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            images: true,
            sizes: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("❌ خطا در دریافت محصول:", error);
    return NextResponse.json({ error: "خطا در دریافت محصول" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authReq = await requireAuth(req, true);
    if (!authReq) {
      return NextResponse.json(
        { error: "Unauthorized - admin access required" },
        { status: 401 },
      );
    }

    const id = Number(params.id);
    const data = await req.json();

    if (!data.name || !data.brand || !data.price || !data.variants) {
      return NextResponse.json(
        { error: "تمام فیلدهای ضروری را پر کنید" },
        { status: 400 },
      );
    }

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      await tx.variant.deleteMany({ where: { productId: id } });

      return tx.product.update({
        where: { id },
        data: {
          name: data.name.trim(),
          brand: data.brand.trim(),
          description: data.description || "",
          price: Number(data.price),
          variants: {
            create: data.variants.map((variant: any) => ({
              color: variant.color,
              images: {
                create: variant.images
                  .filter((img: any) => img.url)
                  .map((img: any) => ({ url: img.url })),
              },
              sizes: {
                create:
                  variant.sizes?.map((size: any) => ({
                    size: size.size,
                    stock: size.stock,
                  })) ?? [],
              },
            })),
          },
        },
        include: {
          variants: {
            include: {
              images: true,
              sizes: true,
            },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "محصول با موفقیت بروزرسانی شد",
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error("❌ خطا در ویرایش محصول:", error);
    return NextResponse.json(
      { error: "خطا در ویرایش محصول", message: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authReq = await requireAuth(req, true);
    if (!authReq) {
      return NextResponse.json(
        { error: "Unauthorized - admin access required" },
        { status: 401 },
      );
    }

    const id = Number(params.id);

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "محصول با موفقیت حذف شد",
    });
  } catch (error: any) {
    console.error("❌ خطا در حذف محصول:", error);
    return NextResponse.json(
      { error: "خطا در حذف محصول", message: error.message },
      { status: 500 },
    );
  }
}
