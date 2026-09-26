import { NextResponse } from "next/server";

/**
 * Returns a consistent JSON error response.
 *
 * @param message - Human‑readable error message.
 * @param status - HTTP status code to return.
 * @returns NextResponse with `{ error, success: false }` payload.
 */
export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message, success: false }, { status });
}

/**
 * Helper to create successful JSON responses.
 * @param data - Payload to return.
 * @param status - HTTP status code (default 200).
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Helper for unauthorized (401) responses.
 * @param message - Optional custom message.
 */
export function unauthorizedResponse(message: string = "Unauthorized") {
  return errorResponse(message, 401);
}
