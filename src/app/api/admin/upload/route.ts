import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "هیچ فایلی ارسال نشده است" },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "فقط فایل‌های تصویری مجاز هستند" },
        { status: 400 },
      );
    }

    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const filename = `product-${timestamp}.${fileExtension}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "images", "products");
    const filepath = path.join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });

    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      imageUrl: `/images/products/${filename}`,
    });
  } catch (error) {
    console.error("خطا در آپلود:", error);
    return NextResponse.json({ error: "خطا در آپلود فایل" }, { status: 500 });
  }
}
