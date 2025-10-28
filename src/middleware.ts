import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/" // صفحه اصلی
  ) {
    return NextResponse.next();
  }

  if (!token) {
    console.warn("🚫 دسترسی غیرمجاز بدون ورود:", pathname);
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/admin")) {
    if (token.role !== "admin") {
      console.warn("🚫 کاربر غیرادمین تلاش برای ورود به /admin:", token);
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  console.log("✅ دسترسی مجاز برای:", pathname, "کاربر:", token.username);
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/cart", "/order", "/checkout"],
};
