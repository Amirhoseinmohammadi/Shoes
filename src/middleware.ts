import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log(`🟡 Middleware اجرا شد برای مسیر: ${pathname}`);

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log("🔍 Token موجود:", token ? "✅ بله" : "❌ خیر");
  if (token) {
    console.log("👤 کاربر:", token.telegramId, token.firstName);
  }

  console.log("🔓 وضعیت فعلی: غیرفعال (اجازه‌ی دسترسی برای همه)");

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/cart", "/order", "/checkout"],
};
