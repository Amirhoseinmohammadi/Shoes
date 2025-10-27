import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // 🔥 غیرفعال کردن کامل middleware
  console.log(
    "🔓 Middleware غیرفعال شده - اجازه دسترسی به:",
    req.nextUrl.pathname,
  );
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/cart", "/order", "/checkout"],
};
