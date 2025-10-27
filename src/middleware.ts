import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = ["/admin", "/profile", "/cart", "/order"];
const adminRoutes = ["/admin"];
const apiRoutes = ["/api/orders"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (!isProtected) {
    return NextResponse.next();
  }

  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      console.log("❌ کاربر لاگین نکرده");
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (isAdminRoute) {
      const isAdmin =
        token.role === "ADMIN" ||
        token.telegramId ===
          parseInt(process.env.NEXT_PUBLIC_ADMIN_USER_ID || "697803275");

      if (!isAdmin) {
        return NextResponse.redirect(new URL("/access-denied", req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("❌ خطا در middleware:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/cart", "/order", "/checkout"],
};
