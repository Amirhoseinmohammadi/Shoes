import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromCookie } from "@/lib/jwt";

const protectedRoutes = ["/admin", "/profile", "/cart", "/order"];
const adminRoutes = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route));

  if (!isProtected) {
    return NextResponse.next();
  }

  const cookieHeader = req.headers.get("cookie");
  const token = getTokenFromCookie(cookieHeader);

  if (!token) {
    console.log("❌ توکن موجود نیست - redirect به /");
    return NextResponse.redirect(new URL("/", req.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    console.log("❌ توکن نامعتبر - redirect به /");
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isAdmin) {
    const adminId = parseInt(
      process.env.NEXT_PUBLIC_ADMIN_USER_ID || "697803275",
    );

    if (payload.telegramId !== adminId) {
      console.log("❌ دسترسی غیرمجاز به admin");
      return NextResponse.redirect(new URL("/access-denied", req.url));
    }
  }

  console.log("✅ دسترسی مجاز:", pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/cart", "/order"],
};
