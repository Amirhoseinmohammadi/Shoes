"use client";
import { useApi } from "@/hooks/useApi";
import { useTelegram } from "@/hooks/useTelegram";
import Link from "next/link";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
  product: { name: string };
}

interface Order {
  id: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const getStatusInfo = (status: string) => {
  const statusMap = {
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
  const { user: telegramUser, loading: telegramLoading } = useTelegram();
  const { data: orders, error, isLoading } = useApi.useOrders(telegramUser?.id);

  if (telegramLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-4 pb-32">
        <div className="mx-auto max-w-2xl px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-24 rounded-2xl bg-gray-300"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-gray-300"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 pb-32">
        <div className="px-4 text-center">
          <svg
            className="mx-auto mb-2 h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            خطا در بارگذاری
          </h2>
          <p className="mb-4 text-gray-600">
            {error?.message || "خطا در دریافت سفارشات"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-cyan-500 px-6 py-2 font-semibold text-white transition hover:bg-cyan-600"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  if (!telegramUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 pb-32">
        <div className="px-4 text-center">
          <svg
            className="mx-auto mb-2 h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            لطفاً وارد شوید
          </h2>
          <p className="mb-4 text-gray-600">
            برای مشاهده سفارشات خود، از طریق تلگرام وارد شوید
          </p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-4 pb-32">
        <div className="mx-auto max-w-2xl px-4">
          {/* Header */}
          <div className="mb-6 rounded-2xl bg-cyan-100 p-4">
            <h1 className="text-xl font-bold text-cyan-900">سفارشات من</h1>
            <p className="mt-1 text-sm text-cyan-700">
              خوش آمدید، {telegramUser.first_name}!
            </p>
          </div>

          {/* Empty State */}
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              هنوز سفارشی ثبت نشده
            </h2>
            <p className="mb-6 text-gray-600">
              شروع به خرید کنید و سفارشات خود را اینجا ببینید
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 font-bold text-white transition hover:bg-cyan-600"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
              مشاهده محصولات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-32">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-6 rounded-2xl bg-cyan-100 p-4">
          <h1 className="text-xl font-bold text-cyan-900">سفارشات من</h1>
          <p className="mt-1 text-sm text-cyan-700">
            خوش آمدید، {telegramUser.first_name}! ({orders.length} سفارش)
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const totalAmount = order.items.reduce(
              (total, item) => total + item.price * item.quantity,
              0,
            );

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-4 py-3">
                  <div>
                    <h2 className="font-bold text-gray-900">
                      سفارش #{order.id}
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("fa-IR")}{" "}
                      ساعت{" "}
                      {new Date(order.createdAt).toLocaleTimeString("fa-IR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${statusInfo.color}`}
                  >
                    <span>{statusInfo.icon}</span>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Items */}
                <div className="px-4 py-3">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    محصولات:
                  </h3>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {item.product.name}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            <span className="text-xs text-gray-500">
                              تعداد: {item.quantity}
                            </span>
                            {item.size && (
                              <span className="text-xs text-gray-500">
                                سایز: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <div
                                  className="h-3 w-3 rounded-full border border-gray-300"
                                  style={{
                                    backgroundColor:
                                      item.color === "سفید"
                                        ? "#FFFFFF"
                                        : item.color === "مشکی"
                                          ? "#000000"
                                          : item.color === "نارنجی"
                                            ? "#FF8C00"
                                            : item.color === "قرمز"
                                              ? "#EF4444"
                                              : "#ccc",
                                  }}
                                />
                                رنگ: {item.color}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">تومان</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3">
                  <span className="font-semibold text-gray-900">جمع کل:</span>
                  <span className="text-lg font-bold text-cyan-600">
                    {totalAmount.toLocaleString()} تومان
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
