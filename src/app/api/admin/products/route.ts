import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // ✅ مرحله 1: بررسی احراز هویت ادمین
    const authReq = await requireAuth(request, true);
    if (!authReq) {
      console.warn("❌ Unauthorized GET products attempt");
      return NextResponse.json(
        { error: "Unauthorized - admin access required" },
        { status: 401 },
      );
    }

    console.log(`✅ Admin ${authReq.userId} fetching products`);

    // ✅ مرحله 2: دریافت تمام محصولات
    const products = await prisma.product.findMany({
      include: {
        variants: {
          include: {
            images: true,
            sizes: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json(
      { error: "خطا در دریافت محصولات" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // ✅ مرحله 1: بررسی احراز هویت ادمین
    const authReq = await requireAuth(request, true);
    if (!authReq) {
      console.warn("❌ Unauthorized POST product attempt");
      return NextResponse.json(
        { error: "Unauthorized - admin access required" },
        { status: 401 },
      );
    }

    console.log(`✅ Admin ${authReq.userId} creating product`);

    // ✅ مرحله 2: دریافت داده های از request
    const data = await request.json();

    // ✅ مرحله 3: اعتبارسنجی داده های ضروری
    if (!data.name || !data.brand || !data.price || !data.variants) {
      return NextResponse.json(
        {
          error: "تمام فیلدهای ضروری را پر کنید",
          required: ["name", "brand", "price", "variants"],
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(data.variants) || data.variants.length === 0) {
      return NextResponse.json(
        { error: "حداقل یک واریانت الزامی است" },
        { status: 400 },
      );
    }

    // ✅ مرحله 4: بررسی اینکه هر واریانت حداقل یک تصویر دارد
    const hasInvalidVariants = data.variants.some(
      (v: any) => !v.color || !v.images || v.images.length === 0,
    );

    if (hasInvalidVariants) {
      return NextResponse.json(
        { error: "هر واریانت باید نام رنگ و حداقل یک تصویر داشته باشد" },
        { status: 400 },
      );
    }

    // ✅ مرحله 5: بررسی نام منحصر به فرد
    const existingProduct = await prisma.product.findUnique({
      where: { name: data.name.trim() },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "محصولی با این نام قبلاً وجود دارد" },
        { status: 400 },
      );
    }

    // ✅ مرحله 6: ایجاد محصول و واریانت‌ها
    const product = await prisma.product.create({
      data: {
        name: data.name.trim(),
        brand: data.brand.trim(),
        description: data.description?.trim() || "",
        price: Number(data.price),
        category: data.category || null,
        image: data.image || "",
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

    console.log(`✅ Product ${product.id} created by admin ${authReq.userId}`);

    return NextResponse.json({
      success: true,
      message: "محصول با موفقیت ایجاد شد",
      product,
    });
  } catch (error: any) {
    console.error("❌ Error creating product:", error);
    return NextResponse.json(
      {
        error: "خطا در ایجاد محصول",
        message: error.message || "خطای نامشخص",
      },
      { status: 500 },
    );
  }
}
