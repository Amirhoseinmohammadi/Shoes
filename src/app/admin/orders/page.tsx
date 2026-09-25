"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import AccessDenied from "@/components/Common/AccessDenied";
import LoadingSkeleton from "@/components/Common/LoadingSkeleton";
import EmptyState from "@/components/Common/EmptyState";
import StatusBadge from "@/components/Common/StatusBadge";
import { OrderStatus } from "@/types/order";
import {
  ArrowRightIcon,
  ClipboardDocumentListIcon,
  FunnelIcon,
  PhoneIcon,
  MapPinIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  color?: string | null;
  size?: string | null;
  product: {
    name: string;
    brand: string;
    image?: string | null;
  };
}

interface OrderData {
  id: number;
  customerName: string;
  customerPhone: string;
  address?: string | null;
  notes?: string | null;
  total: number;
  status: OrderStatus;
  trackingCode?: string | null;
  createdAt: string;
  items: OrderItem[];
}

const statusOptions: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "همه سفارشات", value: "ALL" },
  { label: "در انتظار بررسی", value: "PENDING" },
  { label: "تأیید شده", value: "CONFIRMED" },
  { label: "در حال پردازش", value: "PROCESSING" },
  { label: "ارسال شده", value: "SHIPPED" },
  { label: "تحویل داده شده", value: "DELIVERED" },
  { label: "لغو شده", value: "CANCELLED" },
];

export default function AdminOrdersPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "ALL">("ALL");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const url =
        selectedStatus === "ALL"
          ? "/api/admin/orders"
          : `/api/admin/orders?status=${selectedStatus}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching admin orders:", err);
      toast.error("خطا در بارگذاری سفارشات");
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin, fetchOrders]);

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("وضعیت سفارش به‌روزرسانی شد");
        setOrders((prev) =>
          prev.map((ord) =>
            ord.id === orderId ? { ...ord, status: newStatus } : ord,
          ),
        );
      } else {
        toast.error(data.error || "خطا در تغییر وضعیت");
      }
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("خطا در برقراری ارتباط");
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingSkeleton type="card" count={4} />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Top Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 shadow-sm transition hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              title="بازگشت به داشبورد"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ClipboardDocumentListIcon className="h-7 w-7 text-cyan-500" />
                مدیریت سفارشات
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                مشاهده و تغییر وضعیت سفارش‌های مشتریان
              </p>
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-2">
            <FunnelIcon className="h-4 w-4" />
            <span>فیلتر:</span>
          </div>
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedStatus(opt.value)}
              className={`rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                selectedStatus === opt.value
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                  : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-700/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            <LoadingSkeleton type="card" count={4} />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="سفارشی یافت نشد"
            description="در این دسته‌بندی فعلاً سفارشی ثبت نشده است."
            icon={<ClipboardDocumentListIcon className="h-8 w-8" />}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-800"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">
                      #{order.id}
                    </span>
                    {order.trackingCode && (
                      <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-mono text-gray-600 dark:bg-gray-700/50 dark:text-gray-300">
                        کد پیگیری: {order.trackingCode}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />

                    {/* Status change select */}
                    <div className="relative">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) =>
                          handleStatusChange(
                            order.id,
                            e.target.value as OrderStatus,
                          )
                        }
                        className="appearance-none rounded-xl border border-gray-200 bg-gray-50 py-1.5 pr-3 pl-8 text-xs font-medium text-gray-700 transition focus:border-cyan-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 disabled:opacity-50"
                      >
                        {statusOptions
                          .filter((o) => o.value !== "ALL")
                          .map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 text-sm">
                  <div className="space-y-1.5">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      مشتری: {order.customerName}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <PhoneIcon className="h-3.5 w-3.5" />
                      <span dir="ltr">{order.customerPhone}</span>
                    </div>
                    {order.address && (
                      <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <MapPinIcon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>{order.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 rounded-xl bg-gray-50/70 p-3 dark:bg-gray-900/40">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      اقلام سفارش ({order.items.length}):
                    </div>
                    <div className="space-y-1.5">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300"
                        >
                          <div className="flex items-center gap-2">
                            <span>• {item.product.name}</span>
                            {item.color && (
                              <span className="text-gray-400">({item.color})</span>
                            )}
                            {item.size && (
                              <span className="text-gray-400">سایز {item.size}</span>
                            )}
                            <span className="font-semibold text-cyan-600">
                              ×{item.quantity}
                            </span>
                          </div>
                          <span className="font-mono">
                            {(item.price * item.quantity).toLocaleString("fa-IR")}{" "}
                            تومان
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Total */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm dark:border-gray-700">
                  {order.notes ? (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      یادداشت: {order.notes}
                    </span>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      مبلغ کل:
                    </span>
                    <span className="text-base font-bold text-gray-900 dark:text-white">
                      {order.total.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
