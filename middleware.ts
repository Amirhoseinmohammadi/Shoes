import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/src/lib/session";

const SESSION_COOKIE_NAME = "telegram_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/cart") ||
    pathname.startsWith("/api/orders") ||
    pathname.startsWith("/api/admin")
  ) {
    try {
      const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

      if (!token) {
        console.warn(`❌ Unauthorized request to ${pathname} - no cookie`);
        return NextResponse.json(
          { error: "Unauthorized - لطفا وارد شوید", success: false },
          { status: 401 },
        );
      }

      const session = await verifySession(token);

      if (!session) {
        console.warn(`❌ Unauthorized request to ${pathname} - invalid token`);
        return NextResponse.json(
          { error: "Unauthorized - لطفا وارد شوید", success: false },
          { status: 401 },
        );
      }

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-session-user-id", session.userId.toString());
      requestHeaders.set(
        "x-session-is-admin",
        session.isAdmin ? "true" : "false",
      );
      if (session.username) {
        requestHeaders.set("x-session-username", String(session.username));
      }

      console.log(
        `✅ Authenticated request to ${pathname} by user ${session.userId}`,
      );

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error("❌ Middleware error:", error);
      return NextResponse.json(
        { error: "Authentication failed", success: false },
        { status: 500 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/cart/:path*", "/api/orders/:path*", "/api/admin/:path*"],
};
