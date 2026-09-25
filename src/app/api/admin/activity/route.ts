import { NextResponse } from "next/server";
import { adminService } from "@/services/admin.service";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const activities = await adminService.getRecentActivities();
    return NextResponse.json({ success: true, activities });
  } catch (error) {
    console.error("GET /api/admin/activity error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت فعالیت‌های اخیر" },
      { status: 500 },
    );
  }
}
