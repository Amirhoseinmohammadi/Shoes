import { NextRequest } from "next/server";

export interface AuthenticatedRequest extends NextRequest {
  userId?: number;
  isAdmin?: boolean;
  username?: string;
}

export async function requireAuth(
  request: NextRequest,
  requireAdmin: boolean = false,
): Promise<AuthenticatedRequest | null> {
  const userId = request.headers.get("x-session-user-id");
  const isAdmin = request.headers.get("x-session-is-admin") === "true";
  const username = request.headers.get("x-session-username") || undefined;

  if (!userId) {
    console.warn("❌ Unauthorized: missing user id");
    return null;
  }

  if (requireAdmin && !isAdmin) {
    console.warn(`❌ Forbidden: user ${userId} is not admin`);
    return null;
  }

  (request as AuthenticatedRequest).userId = Number(userId);
  (request as AuthenticatedRequest).isAdmin = isAdmin;
  (request as AuthenticatedRequest).username = username;

  return request as AuthenticatedRequest;
}
