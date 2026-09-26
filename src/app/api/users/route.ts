import { NextRequest, NextResponse } from "next/server";
import { errorResponse, successResponse, unauthorizedResponse } from "@/lib/apiResponse";
import { userService } from "@/services/user.service";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
    return unauthorizedResponse();
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 50;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!)
      : 0;

    const users = await userService.getAllUsers({ search, limit, offset });
    const totalCount = await userService.getUserCount();

    return successResponse({ users,
      totalCount, });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت کاربران" },
      { status: 500 },
    );
  }
}
