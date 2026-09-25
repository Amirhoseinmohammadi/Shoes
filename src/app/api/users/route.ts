import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/services/user.service";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
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

    return NextResponse.json({
      success: true,
      users,
      totalCount,
    });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت کاربران" },
      { status: 500 },
    );
  }
}
