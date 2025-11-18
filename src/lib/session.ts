// src/lib/session.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.TELEGRAM_BOT_TOKEN || "your-bot-token-fallback",
);

export const SESSION_COOKIE_NAME = "telegram_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours (in milliseconds)

export interface SessionPayload {
  userId: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  isAdmin: boolean;
  iat?: number;
  // Index Signature برای سازگاری با JWTPayload
  [propName: string]: unknown;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

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

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSession(payload);

  // ✅ اصلاح: Type Casting به 'any' برای رفع خطای "Property 'set' does not exist"
  const cookieStore: any = cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  // ✅ اصلاح: Type Casting به 'any' برای رفع خطای "Property 'get' does not exist"
  const cookieStore: any = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return await verifySession(token);
}

export async function clearSessionCookie(): Promise<void> {
  // ✅ اصلاح: Type Casting به 'any'
  const cookieStore: any = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
