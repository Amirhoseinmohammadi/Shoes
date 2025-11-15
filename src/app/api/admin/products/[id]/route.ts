import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "@/lib/auth-guard";

const prisma = new PrismaClient();

// =====================
//       GET PRODUCT
// =====================
export async function GET(
  req: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const id = Number(context.params.id);

    console.log("📌 دریافت محصول با ID:", id);

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

// =====================
//       UPDATE PRODUCT
// =====================
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } },
) {
  try {
    // Check Admin Authorization
    const authReq = await requireAuth(req, true);
    if (!authReq) {
      return NextResponse.json(
        { error: "Unauthorized - admin access required" },
        { status: 401 },
      );
    }

    const id = Number(context.params.id);
    const data = await req.json();

    console.log(`✏️ Admin ${authReq.userId} is updating product ${id}`);

    // Basic validation
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
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // حذف واریانت‌های قبلی
      await tx.variant.deleteMany({
        where: { productId: id },
      });

      // بروزرسانی محصول
      return tx.product.update({
        where: { id },
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
                  .map((image: any) => ({ url: image.url })),
              },
              sizes: {
                create: variant.sizes?.map((size: any) => ({
                  size: size.size,
                  stock: size.stock,
                })) || [{ size: "38", stock: 1 }],
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

    console.log(`✅ محصول ${id} با موفقیت بروزرسانی شد`);

    return NextResponse.json({
      success: true,
      message: "محصول با موفقیت بروزرسانی شد",
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error("❌ خطا در ویرایش محصول:", error);
    return NextResponse.json(
      {
        error: "خطا در ویرایش محصول",
        message: error.message || "خطای نامشخص",
      },
      { status: 500 },
    );
  }
}

// =====================
//       DELETE PRODUCT
// =====================
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } },
) {
  try {
    // Check Admin Authorization
    const authReq = await requireAuth(req, true);
    if (!authReq) {
      return NextResponse.json(
        { error: "Unauthorized - admin access required" },
        { status: 401 },
      );
    }

    const id = Number(context.params.id);

    console.log(`🗑️ Admin ${authReq.userId} deleting product ${id}`);

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id },
    });

    console.log(`🗑️ محصول ${id} حذف شد`);

    return NextResponse.json({
      success: true,
      message: "محصول با موفقیت حذف شد",
    });
  } catch (error: any) {
    console.error("❌ خطا در حذف محصول:", error);
    return NextResponse.json(
      {
        error: "خطا در حذف محصول",
        message: error.message || "خطای نامشخص",
      },
      { status: 500 },
    );
  }
}
