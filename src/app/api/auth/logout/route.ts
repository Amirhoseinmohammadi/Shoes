import { NextResponse } from "next/server";
import { errorResponse, successResponse, unauthorizedResponse } from "@/lib/apiResponse";
import { clearSessionCookie } from "@/lib/session";

export async function POST() {
  try {
    await clearSessionCookie();

    return successResponse({ message: "Logged out successfully", });
  } catch (error) {
    console.error("❌ POST /api/auth/logout error:", error);

    return errorResponse("Logout failed", 500);
  }
}

export async function GET() {
    return errorResponse("Method not allowed", 405);
}
