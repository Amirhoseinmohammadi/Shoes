// src/types/order.ts
// ─── Order Types ─────────────────────────────────────────────────────────────

/** باید با enum در schema.prisma یکسان باشد */
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "در انتظار",
  CONFIRMED: "تأیید شده",
  PROCESSING: "در حال پردازش",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل داده شده",
  CANCELLED: "لغو شده",
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "text-yellow-600",
  CONFIRMED: "text-blue-600",
  PROCESSING: "text-indigo-600",
  SHIPPED: "text-purple-600",
  DELIVERED: "text-green-600",
  CANCELLED: "text-red-600",
};

/** یک آیتم داخل سفارش */
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  color?: string | null;
  size?: string | null;
  product: {
    id: number;
    name: string;
    brand: string;
    price: number;
    image?: string | null;
  };
}

/** سفارش کامل */
export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  total: number;
  customerName: string;
  customerPhone: string;
  address?: string | null;
  notes?: string | null;
  trackingCode?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

/** ورودی ثبت سفارش از سمت client */
export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  address?: string;
  notes?: string;
}

/** ورودی تغییر وضعیت سفارش */
export interface UpdateOrderStatusInput {
  status: OrderStatus;
}
