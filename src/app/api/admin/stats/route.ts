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

    const stats = await adminService.getDashboardStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت آمار داشبورد" },
      { status: 500 },
    );
  }
}
