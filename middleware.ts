import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.TELEGRAM_BOT_TOKEN || "your-bot-token-fallback",
);

const SESSION_COOKIE_NAME = "telegram_session";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const publicEndpoints = [
    "/api/validate-init",
    "/api/telegram/bot",
    "/api/products",
    "/api/auth/logout",
    "/api/orders", // ✅ اضافه شد!
  ];

  if (publicEndpoints.some((ep) => request.nextUrl.pathname.startsWith(ep))) {
    return NextResponse.next();
  }

  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.next();
    }

    const verified = await jwtVerify(token, secret);
    const payload = verified.payload as any;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-session-user-id", String(payload.userId));
    requestHeaders.set("x-session-is-admin", String(payload.isAdmin || false));
    requestHeaders.set("x-session-username", payload.username || "");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
