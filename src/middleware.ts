import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = ["/admin", "/profile", "/cart", "/order"];
const adminRoutes = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // اگر مسیر محافظت شده نیست، اجازه دسترسی بده
  if (!isProtected) {
    return NextResponse.next();
  }

  try {
    // دریافت توکن از NextAuth
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // اگر توکن وجود ندارد یا کاربر لاگین نکرده
    if (!token) {
      console.log("❌ کاربر لاگین نکرده - redirect به /");
      return NextResponse.redirect(new URL("/", req.url));
    }

    // اگر مسیر ادمین است، بررسی دسترسی
    if (isAdminRoute) {
      const isAdmin =
        token.role === "ADMIN" ||
        token.telegramId ===
          parseInt(process.env.NEXT_PUBLIC_ADMIN_USER_ID || "697803275");

      if (!isAdmin) {
        console.log("🚫 دسترسی غیرمجاز به ادمین - redirect به /access-denied");
        return NextResponse.redirect(new URL("/access-denied", req.url));
      }
    }

    console.log("✅ دسترسی مجاز:", pathname, "کاربر:", token.telegramId);
    return NextResponse.next();
  } catch (error) {
    console.error("❌ خطا در middleware:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/cart", "/order", "/checkout"],
};
