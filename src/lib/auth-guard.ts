import { NextRequest, NextResponse } from "next/server";

export interface AuthenticatedRequest extends NextRequest {
  userId?: number;
  isAdmin?: boolean;
}

/**
 * Middleware to check authentication on API routes
 * Usage:
 *   const req = await requireAuth(request);
 *   if (!req) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 */
export async function requireAuth(
  request: NextRequest,
  requireAdmin: boolean = false,
): Promise<AuthenticatedRequest | null> {
  // Get user info from headers set by middleware
  const userId = request.headers.get("x-session-user-id");
  const isAdmin = request.headers.get("x-session-is-admin") === "true";

  if (!userId) {
    console.warn("❌ Unauthorized request: missing user id");
    return null;
  }

  if (requireAdmin && !isAdmin) {
    console.warn(`❌ Unauthorized request: user ${userId} is not admin`);
    return null;
  }

  // Attach auth info to request
  (request as AuthenticatedRequest).userId = Number(userId);
  (request as AuthenticatedRequest).isAdmin = isAdmin;

  return request as AuthenticatedRequest;
}
