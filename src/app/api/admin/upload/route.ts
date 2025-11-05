import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(request: NextRequest) {
  try {
    const authReq = await requireAuth(request, true);
    if (!authReq) {
      console.warn("❌ Unauthorized upload attempt");
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز - فقط ادمین می‌تواند" },
        { status: 401 },
      );
    }

    console.log(`✅ Admin ${authReq.userId} uploading image`);

    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "هیچ فایلی ارسال نشده است" },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "فقط فایل‌های تصویری مجاز هستند" },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: "حجم فایل نباید بیشتر از 5MB باشد",
        },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    console.log(`✅ Image uploaded successfully by admin ${authReq.userId}`);

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
      message: "تصویر با موفقیت آپلود شد",
    });
  } catch (error: any) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطا در آپلود فایل",
        message: error.message || "خطای نامشخص",
      },
      { status: 500 },
    );
  }
}
