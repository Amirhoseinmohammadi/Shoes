"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AccessDenied from "@/components/Common/AccessDenied";
import LoadingSkeleton from "@/components/Common/LoadingSkeleton";
import StatusBadge from "@/components/Common/StatusBadge";
import {
  CubeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  BanknotesIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  todayOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

interface RecentActivity {
  recentOrders: {
    id: number;
    customerName: string;
    total: number;
    status: any;
    createdAt: string;
    user?: {
      firstName?: string | null;
      lastName?: string | null;
      username?: string | null;
    } | null;
  }[];
  recentUsers: {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    createdAt: string;
  }[];
}

const adminNavCards = [
  {
    href: "/admin/products",
    title: "مدیریت محصولات",
    description: "افزودن، ویرایش، حذف و مدیریت موجودی کفش‌ها",
    icon: <CubeIcon className="h-8 w-8 text-cyan-400" />,
    gradient: "from-cyan-900/40 via-cyan-800/20 to-gray-900 border-cyan-500/20 hover:border-cyan-500/50",
  },
  {
    href: "/admin/orders",
    title: "مدیریت سفارشات",
    description: "مشاهده فاکتورها، پیگیری مرسولات و تغییر وضعیت",
    icon: <ClipboardDocumentListIcon className="h-8 w-8 text-blue-400" />,
    gradient: "from-blue-900/40 via-blue-800/20 to-gray-900 border-blue-500/20 hover:border-blue-500/50",
  },
  {
    href: "/admin/users",
    title: "کاربران و مشتریان",
    description: "مشاهده لیست اعضا، اطلاعات تلگرام و سوابق خرید",
    icon: <UserGroupIcon className="h-8 w-8 text-emerald-400" />,
    gradient: "from-emerald-900/40 via-emerald-800/20 to-gray-900 border-emerald-500/20 hover:border-emerald-500/50",
  },
  {
    href: "/admin/settings",
    title: "تنظیمات فروشگاه",
    description: "پیکربندی بات تلگرام، ارسال پیام و مشخصات عمومی",
    icon: <Cog6ToothIcon className="h-8 w-8 text-purple-400" />,
    gradient: "from-purple-900/40 via-purple-800/20 to-gray-900 border-purple-500/20 hover:border-purple-500/50",
  },
];

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      const fetchDashboardData = async () => {
        try {
          const [statsRes, activityRes] = await Promise.all([
            fetch("/api/admin/stats").then((r) => r.json()),
            fetch("/api/admin/activity").then((r) => r.json()),
          ]);

          if (statsRes.success) setStats(statsRes.stats);
          if (activityRes.success) setActivities(activityRes.activities);
        } catch (err) {
          console.error("Dashboard data load error:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [isAdmin]);

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
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Welcome Banner */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl shadow-cyan-950/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                پنل مدیریت فروشگاه
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                سلام، {user?.first_name || "مدیر گرامی"} 👋
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-cyan-100 max-w-xl">
                به پیشخوان مدیریت فروشگاه کفش ایران استپس خوش آمدید. آمار و وضعیت جاری در زیر قابل مشاهده است.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between text-cyan-600 dark:text-cyan-400">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">کل محصولات</span>
              <CubeIcon className="h-6 w-6" />
            </div>
            <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? "..." : (stats?.totalProducts ?? 0).toLocaleString("fa-IR")}
            </div>
            <div className="mt-1 text-[11px] text-gray-400">
              {stats?.activeProducts ?? 0} محصول فعال
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">کل سفارشات</span>
              <ShoppingBagIcon className="h-6 w-6" />
            </div>
            <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? "..." : (stats?.totalOrders ?? 0).toLocaleString("fa-IR")}
            </div>
            <div className="mt-1 text-[11px] text-emerald-500 font-medium">
              +{stats?.todayOrders ?? 0} سفارش امروز
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">مجموع درآمد</span>
              <BanknotesIcon className="h-6 w-6" />
            </div>
            <div className="mt-3 text-xl font-bold text-gray-900 dark:text-white truncate">
              {loading ? "..." : `${(stats?.totalRevenue ?? 0).toLocaleString("fa-IR")} ت`}
            </div>
            <div className="mt-1 text-[11px] text-gray-400">
              فروش خالص تا اکنون
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">کاربران ثبت‌نامی</span>
              <UserGroupIcon className="h-6 w-6" />
            </div>
            <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? "..." : (stats?.totalUsers ?? 0).toLocaleString("fa-IR")}
            </div>
            <div className="mt-1 text-[11px] text-gray-400">
              مشتریان ثبت شده
            </div>
          </div>
        </div>

        {/* Action Navigation Cards */}
        <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminNavCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group flex flex-col justify-between rounded-2xl border bg-gradient-to-b p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900 ${card.gradient}`}
            >
              <div>
                <div className="mb-4 inline-flex rounded-xl bg-white/10 p-2.5 backdrop-blur-md">
                  {card.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-cyan-400 transition-colors">
                  {card.title}
                </h3>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {card.description}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                <span>ورود به بخش</span>
                <span className="transition-transform group-hover:-translate-x-1">←</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activities Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800 mb-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-blue-500" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  آخرین سفارشات
                </h3>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                مشاهده همه
              </Link>
            </div>

            {loading ? (
              <LoadingSkeleton type="line" count={4} />
            ) : activities?.recentOrders?.length ? (
              <div className="space-y-3">
                {activities.recentOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-xs dark:bg-gray-800/50"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {ord.customerName}
                      </div>
                      <div className="text-gray-400 mt-0.5">
                        {new Date(ord.createdAt).toLocaleDateString("fa-IR")} ·{" "}
                        {ord.total.toLocaleString("fa-IR")} تومان
                      </div>
                    </div>
                    <StatusBadge status={ord.status} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">
                هنوز سفارشی ثبت نشده است.
              </p>
            )}
          </div>

          {/* Recent Registered Users */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800 mb-4">
              <div className="flex items-center gap-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  کاربران جدید
                </h3>
              </div>
              <Link
                href="/admin/users"
                className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                مشاهده همه
              </Link>
            </div>

            {loading ? (
              <LoadingSkeleton type="line" count={4} />
            ) : activities?.recentUsers?.length ? (
              <div className="space-y-3">
                {activities.recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-xs dark:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-600 font-bold text-[11px] text-white">
                        {(u.firstName || "ک").slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {[u.firstName, u.lastName].filter(Boolean).join(" ") || "کاربر ناشناس"}
                        </div>
                        <div className="text-gray-400 mt-0.5">
                          {u.username ? `@${u.username}` : "عضو تلگرام"}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString("fa-IR")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">
                هنوز کاربری ثبت نشده است.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
