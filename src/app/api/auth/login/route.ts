import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1️⃣ دریافت body
    console.log("📥 [LOGIN] درخواست دریافت شد");
    const body = await req.json();
    const { telegramId, firstName, lastName, username } = body;

    console.log("📋 [LOGIN] داده‌های دریافتی:", {
      telegramId,
      username,
      firstName,
      lastName,
      hasFirstName: !!firstName,
      hasLastName: !!lastName,
      hasUsername: !!username,
    });

    // 2️⃣ اعتبارسنجی
    if (!telegramId) {
      console.error("❌ [LOGIN] Telegram ID موجود نیست");
      return NextResponse.json(
        { success: false, error: "Telegram ID الزامی است" },
        { status: 400 },
      );
    }

    const tgId = parseInt(telegramId.toString());

    if (isNaN(tgId)) {
      console.error("❌ [LOGIN] Telegram ID نامعتبر:", telegramId);
      return NextResponse.json(
        { success: false, error: "Telegram ID نامعتبر است" },
        { status: 400 },
      );
    }

    console.log("✅ [LOGIN] Telegram ID معتبر:", tgId);

    // 3️⃣ جستجوی کاربر
    console.log("🔍 [LOGIN] جستجوی کاربر با Telegram ID:", tgId);
    let user = await prisma.user.findUnique({
      where: { telegramId: tgId },
    });

    if (user) {
      console.log("✅ [LOGIN] کاربر موجود یافت شد:", {
        userId: user.id,
        username: user.username,
        telegramId: user.telegramId,
      });

      // به‌روزرسانی اطلاعات
      console.log("🔄 [LOGIN] به‌روزرسانی اطلاعات کاربر");
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          username: username || user.username,
          updatedAt: new Date(),
        },
      });
      console.log("✅ [LOGIN] اطلاعات کاربر به‌روز شد");
    } else {
      console.log("➕ [LOGIN] کاربر جدید - شروع ساخت");

      try {
        user = await prisma.user.create({
          data: {
            telegramId: tgId,
            username: username || `user_${tgId}`,
            firstName: firstName || null,
            lastName: lastName || null,
          },
        });

        console.log("✅ [LOGIN] کاربر جدید ساخته شد:", {
          userId: user.id,
          username: user.username,
          telegramId: user.telegramId,
        });
      } catch (createError: any) {
        console.error("❌ [LOGIN] خطا در ساخت کاربر:", {
          error: createError.message,
          code: createError.code,
          meta: createError.meta,
        });
        throw createError;
      }
    }

    // 4️⃣ ساخت JWT Token
    console.log("🔐 [LOGIN] شروع ساخت JWT Token");
    const tokenPayload = {
      userId: user.id,
      telegramId: tgId,
      username: user.username || undefined,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
    };

    console.log("📦 [LOGIN] Token Payload:", tokenPayload);

    const token = await createToken(tokenPayload);

    if (!token) {
      throw new Error("Token ساخته نشد");
    }

    console.log("✅ [LOGIN] JWT Token ساخته شد:", {
      tokenLength: token.length,
      tokenPreview: token.substring(0, 20) + "...",
    });

    // 5️⃣ ساخت Response
    const responseData = {
      success: true,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };

    console.log("📤 [LOGIN] ساخت Response:", responseData);

    const response = NextResponse.json(responseData);

    // 6️⃣ تنظیم Cookie
    console.log("🍪 [LOGIN] تنظیم Cookie");
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 30 * 24 * 60 * 60, // 30 روز
      path: "/",
    };

    console.log("🍪 [LOGIN] Cookie Options:", {
      ...cookieOptions,
      tokenLength: token.length,
    });

    response.cookies.set("auth-token", token, cookieOptions);

    const duration = Date.now() - startTime;
    console.log(`✅ [LOGIN] موفقیت‌آمیز - مدت زمان: ${duration}ms`);

    return response;
  } catch (error: any) {
    const duration = Date.now() - startTime;

    console.error("❌ [LOGIN] خطای کلی:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      duration: `${duration}ms`,
    });

    // بررسی خطاهای خاص Prisma
    if (error.code === "P2002") {
      console.error("❌ [LOGIN] خطای Unique Constraint:", error.meta);
      return NextResponse.json(
        { success: false, error: "این کاربر قبلاً ثبت شده است" },
        { status: 409 },
      );
    }

    if (error.code?.startsWith("P")) {
      console.error("❌ [LOGIN] خطای Database:", {
        code: error.code,
        meta: error.meta,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "خطا در لاگین",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
