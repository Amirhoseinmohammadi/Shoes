import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.TELEGRAM_BOT_TOKEN || "your-bot-token-fallback",
);

const SESSION_COOKIE_NAME = "telegram_session";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/admin",
  "/profile",
  "/cart",
  "/order",
  "/api/admin",
  "/api/cart",
  "/api/orders",
];

// Routes that require admin role
const ADMIN_ROUTES = ["/admin"];

async function verifySessionToken(token: string) {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload;
  } catch (error) {
    console.error("❌ Session token verification failed:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route requires protection
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Get session from cookie
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    console.warn(`⚠️ Access denied to ${pathname} - no session`);

    // For API routes, return 401
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For pages, redirect to home
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Verify session token
  const session = await verifySessionToken(sessionToken);

  if (!session) {
    console.warn(`⚠️ Access denied to ${pathname} - invalid session`);

    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check admin routes
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!session.isAdmin) {
      console.warn(`⚠️ Admin access denied to ${pathname} - not admin`);

      if (pathname.startsWith("/api")) {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 },
        );
      }

      return NextResponse.redirect(new URL("/access-denied", request.url));
    }
  }

  // Pass session to request headers (accessible in route handlers)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-session-user-id", session.userId.toString());
  requestHeaders.set("x-session-is-admin", session.isAdmin.toString());

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
