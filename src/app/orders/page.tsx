"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTelegram } from "@/hooks/useTelegram";

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  image?: string;
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
  total: number;
  trackingCode?: string;
  createdAt: string;
  items: OrderItem[];
}

const getStatusInfo = (status: string) => {
  const statusMap: Record<
    string,
    { label: string; color: string; icon: string }
  > = {
    DELIVERED: {
      label: "تحویل شده",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      icon: "✓",
    },
    PROCESSING: {
      label: "در حال پردازش",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      icon: "⚙️",
    },
    PENDING: {
      label: "در انتظار",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      icon: "⏳",
    },
    CANCELLED: {
      label: "لغو شده",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      icon: "✕",
    },
    SHIPPED: {
      label: "ارسال شده",
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      icon: "🚚",
    },
  };
  return statusMap[status] || statusMap.PENDING;
};

const OrdersPage = () => {
  const {
    user: telegramUser,
    loading: authLoading,
    isTelegram,
  } = useTelegram();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch orders when user is loaded
  useEffect(() => {
    if (authLoading) return; // Still loading auth

    if (!telegramUser?.id) {
      console.warn("⚠️ No telegram user, skipping orders fetch");
      setLoading(false);
      setError(null);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Add telegramId as query parameter
        const url = `/api/orders?telegramId=${telegramUser.id}`;
        console.log("📤 Fetching orders from:", url);

        const res = await fetch(url);
        console.log("📥 Response status:", res.status);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.error || `HTTP ${res.status}: خطا در دریافت سفارشات`,
          );
        }

        const data = await res.json();
        console.log("✅ Orders fetched:", data);

        setOrders(data.orders || []);
      } catch (err: any) {
        console.error("❌ Error fetching orders:", err);
        setError(err.message || "خطا در دریافت سفارشات");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [telegramUser?.id, authLoading]);

  // ✅ Loading auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">
            در حال بررسی دسترسی...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Not logged in
  if (!telegramUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="mb-4 text-red-500">لطفاً وارد سیستم شوید</p>
          <Link
            href="/"
            className="rounded-full bg-cyan-500 px-6 py-2 text-white transition hover:bg-cyan-600"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Loading orders
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">
            در حال بارگذاری سفارشات...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Error
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="mb-4 text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-cyan-500 px-6 py-2 text-white transition hover:bg-cyan-600"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // ✅ No orders
  if (!orders.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 text-6xl">📦</div>
          <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            هیچ سفارشی ثبت نشده است
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            می‌توانید از فروشگاه ما خرید کنید
          </p>
          <Link
            href="/products"
            className="rounded-full bg-cyan-500 px-6 py-3 text-white transition hover:bg-cyan-600"
          >
            مشاهده محصولات
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Show orders
  return (
    <div className="safe-area-bottom min-h-screen bg-gray-50 p-4 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          سفارشات من ({orders.length})
        </h1>
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);

            return (
              <div
                key={order.id}
                className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md dark:bg-gray-800 dark:hover:shadow-lg"
              >
                {/* هدر سفارش */}
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">
                      سفارش #{order.id}
                    </h2>
                    {order.trackingCode && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        کد پیگیری: {order.trackingCode}
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${statusInfo.color}`}
                  >
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                </div>

                {/* تاریخ سفارش */}
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString("fa-IR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  - ساعت{" "}
                  {new Date(order.createdAt).toLocaleTimeString("fa-IR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                {/* محصولات */}
                <div className="mb-4">
                  <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                    محصولات:
                  </h3>
                  <ul className="space-y-3">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start justify-between"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {item.product.name}
                          </span>
                          <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>{item.quantity} عدد</span>
                            <span>•</span>
                            <span>{item.price.toLocaleString()} تومان</span>
                            {item.color && (
                              <>
                                <span>•</span>
                                <span>رنگ: {item.color}</span>
                              </>
                            )}
                            {item.size && (
                              <>
                                <span>•</span>
                                <span>سایز: {item.size}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">
                          {(item.price * item.quantity).toLocaleString()} تومان
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                  <span className="font-bold text-gray-900 dark:text-white">
                    جمع کل:
                  </span>
                  <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                    {order.total.toLocaleString()} تومان
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
