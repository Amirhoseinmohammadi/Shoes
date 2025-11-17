import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/src/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/cart") ||
    pathname.startsWith("/api/orders") ||
    pathname.startsWith("/api/admin")
  ) {
    try {
      const session = await getSession();

      if (!session) {
        console.warn(`❌ Unauthorized request to ${pathname}`);
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
        requestHeaders.set("x-session-username", session.username);
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
