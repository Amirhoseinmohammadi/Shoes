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
        console.warn(`❌ Unauthorized ${pathname} - missing session cookie`);

        return new NextResponse(
          JSON.stringify({
            success: false,
            error: "Unauthorized - لطفا وارد شوید",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const session = await verifySession(token);

      if (!session || typeof session.userId !== "number") {
        console.warn(`❌ Unauthorized ${pathname} - invalid session`);

        return new NextResponse(
          JSON.stringify({
            success: false,
            error: "Unauthorized - لطفا وارد شوید",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-session-user-id", String(session.userId));
      requestHeaders.set(
        "x-session-is-admin",
        session.isAdmin ? "true" : "false",
      );

      if (session.username) {
        requestHeaders.set("x-session-username", session.username);
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error("❌ Middleware authentication error:", error);

      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Authentication failed",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/cart/:path*", "/api/orders/:path*", "/api/admin/:path*"],
};
