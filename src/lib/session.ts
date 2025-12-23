import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error("❌ TELEGRAM_BOT_TOKEN is not set");
}

const secret = new TextEncoder().encode(process.env.TELEGRAM_BOT_TOKEN);

export const SESSION_COOKIE_NAME = "telegram_session";
const SESSION_DURATION_SECONDS = 24 * 60 * 60; // 24h

export interface SessionPayload {
  userId: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
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
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch (error) {
    console.warn("⚠️ Invalid session token");
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSession(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  return await verifySession(token);
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  cookieStore.delete(SESSION_COOKIE_NAME);
}
