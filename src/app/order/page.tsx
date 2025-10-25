"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
  product: Product;
}

interface Order {
  id: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

// تابع کمکی برای تبدیل وضعیت سفارش به label و رنگ
const getStatusInfo = (status: string) => {
  const statusMap: Record<
    string,
    { label: string; color: string; icon: string }
  > = {
    delivered: {
      label: "تحویل شده",
      color: "bg-green-100 text-green-800",
      icon: "✓",
    },
    processing: {
      label: "در حال پردازش",
      color: "bg-blue-100 text-blue-800",
      icon: "⚙️",
    },
    pending: {
      label: "در انتظار",
      color: "bg-yellow-100 text-yellow-800",
      icon: "⏳",
    },
    cancelled: {
      label: "لغو شده",
      color: "bg-red-100 text-red-800",
      icon: "✕",
    },
  };
  return statusMap[status] || statusMap.pending;
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // بارگذاری سفارشات از API
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("خطا در دریافت سفارشات");
        const data: Order[] = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message || "خطا در دریافت سفارشات");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>در حال بارگذاری سفارشات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => location.reload()}
          className="mt-4 rounded bg-cyan-500 px-4 py-2 text-white"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>هیچ سفارشی ثبت نشده است</p>
        <Link
          href="/products"
          className="mt-4 rounded bg-cyan-500 px-4 py-2 text-white"
        >
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900">
      <h1 className="mb-6 text-2xl font-bold">سفارشات من ({orders.length})</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const statusInfo = getStatusInfo(order.status);
          const totalAmount = order.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          );

          return (
            <div
              key={order.id}
              className="rounded-xl bg-white p-4 shadow dark:bg-gray-800"
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-bold">سفارش #{order.id}</h2>
                <span
                  className={`rounded px-2 py-1 text-sm ${statusInfo.color}`}
                >
                  {statusInfo.icon} {statusInfo.label}
                </span>
              </div>
              <p className="mb-2 text-xs text-gray-500">
                {new Date(order.createdAt).toLocaleDateString("fa-IR")} ساعت{" "}
                {new Date(order.createdAt).toLocaleTimeString("fa-IR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              <div className="mb-2">
                <h3 className="mb-1 font-semibold">محصولات:</h3>
                <ul className="space-y-1">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.product.name} ({item.quantity} ×{" "}
                        {item.price.toLocaleString()} تومان)
                      </span>
                      {item.color && <span>رنگ: {item.color}</span>}
                      {item.size && <span>سایز: {item.size}</span>}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-right font-bold text-cyan-600">
                جمع کل: {totalAmount.toLocaleString()} تومان
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersPage;
