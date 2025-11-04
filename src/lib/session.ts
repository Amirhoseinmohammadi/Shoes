import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// This must match the bot token from your .env
const secret = new TextEncoder().encode(
  process.env.TELEGRAM_BOT_TOKEN || "your-bot-token-fallback",
);

const SESSION_COOKIE_NAME = "telegram_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface SessionPayload {
  userId: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  isAdmin: boolean;
  iat?: number;
}

/**
 * Create a signed JWT session token
 */
export async function createSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

/**
 * Verify and decode the session token
 */
export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as SessionPayload;
  } catch (error) {
    console.error("❌ Session verification failed:", error);
    return null;
  }
}

/**
 * Set secure HTTP-only cookie with session
 */
export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSession(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: "/",
  });
}

/**
 * Get session from cookie
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return await verifySession(token);
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
