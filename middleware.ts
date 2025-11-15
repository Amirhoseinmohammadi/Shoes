import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.TELEGRAM_BOT_TOKEN || "your-bot-token-fallback",
);

const SESSION_COOKIE_NAME = "telegram_session";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // ✅ Endpoints بدون نیاز به authentication
  const publicEndpoints = [
    // ✅ Validation/Auth
    { path: "/api/validate-init", methods: ["POST"] },

    // ✅ Telegram webhook
    { path: "/api/telegram/bot", methods: ["POST"] },

    // ✅ Products - فقط GET عمومی است
    { path: "/api/products", methods: ["GET"] },

    // ✅ Logout بدون token (cleanup)
    { path: "/api/auth/logout", methods: ["POST"] },
  ];

  // ✅ Check public endpoints
  const isPublic = publicEndpoints.some((ep) => {
    const pathMatches =
      pathname === ep.path || pathname.startsWith(ep.path + "/");
    const methodMatches = ep.methods.includes(method);
    return pathMatches && methodMatches;
  });

  if (isPublic) {
    return NextResponse.next();
  }

  // ✅ Endpoints که نیاز به authentication دارند
  const protectedPatterns = [
    // ✅ Admin - تمام methods
    { path: "/api/admin", requireAdmin: true },

    // ✅ Cart - تمام methods
    { path: "/api/cart", requireAdmin: false },

    // ✅ Orders - تمام methods
    { path: "/api/orders", requireAdmin: false },

    // ✅ Products - POST/PUT/DELETE (نه GET)
    {
      path: "/api/products",
      requireAdmin: false,
      methods: ["POST", "PUT", "DELETE"],
    },
  ];

  // ✅ بررسی اینکه protected pattern است؟
  let isProtected = false;
  let requireAdmin = false;

  for (const pattern of protectedPatterns) {
    const pathMatches =
      pathname === pattern.path || pathname.startsWith(pattern.path + "/");

    if (pathMatches) {
      // ✅ اگر methods مشخص شده، فقط آنها protected
      if (pattern.methods) {
        if (pattern.methods.includes(method)) {
          isProtected = true;
          requireAdmin = pattern.requireAdmin;
          break;
        }
      } else {
        // ✅ تمام methods protected
        isProtected = true;
        requireAdmin = pattern.requireAdmin;
        break;
      }
    }
  }

  if (!isProtected) {
    return NextResponse.next();
  }

  // 🔐 بررسی token برای protected routes
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      console.warn(`❌ No session token for: ${method} ${pathname}`);
      return NextResponse.json(
        {
          error: "Unauthorized - لطفا وارد شوید",
          success: false,
        },
        { status: 401 },
      );
    }

    // ✅ Verify JWT token
    const verified = await jwtVerify(token, secret);
    const payload = verified.payload as any;

    // ✅ Validate payload
    if (!payload.userId || typeof payload.userId !== "number") {
      console.warn("❌ Invalid token payload - missing userId");
      return NextResponse.json(
        {
          error: "Unauthorized - توکن نامعتبر",
          success: false,
        },
        { status: 401 },
      );
    }
    if (requireAdmin && !payload.isAdmin) {
      console.warn(
        `❌ User ${payload.userId} tried to access admin endpoint: ${method} ${pathname}`,
      );
      return NextResponse.json(
        {
          error: "Forbidden - فقط ادمین",
          success: false,
        },
        { status: 403 },
      );
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-session-user-id", String(payload.userId));
    requestHeaders.set("x-session-is-admin", String(payload.isAdmin || false));
    requestHeaders.set("x-session-username", payload.username || "");
    requestHeaders.set("x-session-first-name", payload.firstName || "");

    console.log(
      `✅ Auth OK: ${method} ${pathname} | user: ${payload.userId}, admin: ${payload.isAdmin}`,
    );

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error: any) {
    console.error(
      `❌ Token verification failed for ${method} ${pathname}:`,
      error.message,
    );

    return NextResponse.json(
      {
        error: "Unauthorized - توکن نامعتبر",
        success: false,
      },
      { status: 401 },
    );
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
