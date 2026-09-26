import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { unauthorizedResponse } from "@/lib/apiResponse";

/**
 * Simple authentication guard that checks the session cookie.
 * Returns the request object with attached user information when authorized,
 * otherwise returns a standardized unauthorized response.
 */
export async function requireAuth(
  request: NextRequest,
  requireAdmin: boolean = false,
): Promise<NextRequest | ReturnType<typeof unauthorizedResponse>> {
  const session = await getSession();
  if (!session?.userId) {
    return unauthorizedResponse();
  }
  if (requireAdmin && !session.isAdmin) {
    return unauthorizedResponse();
  }
  // Attach useful fields to the request for downstream handlers.
  (request as any).userId = session.userId;
  (request as any).isAdmin = session.isAdmin;
  (request as any).username = session.username;
  return request;
}


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
