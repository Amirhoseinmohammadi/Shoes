import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/services/order.service";
import { getSession } from "@/lib/session";
import { OrderStatus } from "@prisma/client";

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
    const statusParam = searchParams.get("status") as OrderStatus | null;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 50;

    const orders = await orderService.getAllOrders({
      status: statusParam && Object.values(OrderStatus).includes(statusParam) ? statusParam : undefined,
      limit,
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت لیست سفارشات" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { orderId, status } = await req.json();

    if (!orderId || !status || !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { success: false, error: "داده‌های ارسالی نامعتبر است" },
        { status: 400 },
      );
    }

    const updatedOrder = await orderService.updateOrderStatus(orderId, status);

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("PATCH /api/admin/orders error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در تغییر وضعیت سفارش" },
      { status: 500 },
    );
  }
}
