import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "@/lib/auth-guard";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;

    console.log("دریافت محصول با ID:", id);

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        variants: {
          include: {
            images: true,
            sizes: true,
          },
        },
      },
    });

    console.log("محصول یافت شد:", product);

    if (!product) {
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("خطا در دریافت محصول:", error);
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

    const id = params.id;
    const data = await req.json();

    console.log(`✅ Admin ${authReq.userId} updating product ${id}`);

    if (!data.name || !data.brand || !data.price || !data.variants) {
      return NextResponse.json(
        { error: "تمام فیلدهای ضروری را پر کنید" },
        { status: 400 },
      );
    }

    if (!Array.isArray(data.variants) || data.variants.length === 0) {
      return NextResponse.json(
        { error: "حداقل یک واریانت الزامی است" },
        { status: 400 },
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      await tx.variant.deleteMany({
        where: { productId: Number(id) },
      });

      const product = await tx.product.update({
        where: { id: Number(id) },
        data: {
          name: data.name.trim(),
          brand: data.brand.trim(),
          description: data.description?.trim() || "",
          price: Number(data.price),
          category: data.category || null,
          variants: {
            create: data.variants.map((variant: any) => ({
              color: variant.color.trim(),
              images: {
                create: variant.images
                  .filter((img: any) => img.url)
                  .map((image: any) => ({
                    url: image.url,
                  })),
              },
              sizes: {
                create: [{ size: "38", stock: 1 }],
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

      return product;
    });

    console.log(`✅ محصول ${id} با موفقیت بروزرسانی شد`);

    return NextResponse.json({
      success: true,
      message: "محصول با موفقیت بروزرسانی شد",
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error("خطا در ویرایش محصول:", error);
    return NextResponse.json(
      {
        error: "خطا در ویرایش محصول",
        message: error.message || "خطای نامشخص",
      },
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

    const id = params.id;

    console.log(`✅ Admin ${authReq.userId} deleting product ${id}`);

    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: Number(id) },
    });

    console.log(`✅ محصول ${id} با موفقیت حذف شد`);

    return NextResponse.json({
      success: true,
      message: "محصول با موفقیت حذف شد",
    });
  } catch (error: any) {
    console.error("خطا در حذف محصول:", error);
    return NextResponse.json(
      {
        error: "خطا در حذف محصول",
        message: error.message || "خطای نامشخص",
      },
      { status: 500 },
    );
  }
}
