"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CubeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";

interface StatCard {
  value: string;
  label: string;
  color: string;
  icon: React.ReactNode;
}

interface AdminCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  textColor: string;
}

// کامپوننت کارت مدیریت
function AdminCard({
  href,
  title,
  description,
  icon,
  gradient,
  textColor,
}: AdminCardProps) {
  return (
    <Link
      href={href}
      aria-label={title}
      className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br p-8 text-white shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl ${gradient}`}
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-20"></div>
      <div className="flex flex-col items-center text-center">
        {icon}
        <h2 className="mb-2 text-xl font-semibold">{title}</h2>
        <p className={`text-sm ${textColor}`}>{description}</p>
      </div>
    </Link>
  );
}

function StatCard({ value, label, color, icon }: StatCard) {
  return (
    <div className="rounded-3xl bg-white/80 p-6 shadow-lg backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-2xl dark:bg-gray-800/80 dark:hover:shadow-gray-700/50">
      <div className="flex flex-col items-center text-center">
        {icon}
        <div
          className={`mt-3 text-3xl font-bold ${color} dark:${color.replace("600", "400")}`}
        >
          {value}
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {label}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 px-4 py-12 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-3xl bg-gray-300 p-8 dark:bg-gray-700"
            ></div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-3xl bg-gray-300 p-6 dark:bg-gray-700"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-gray-800">
        <div className="mb-4 text-6xl">🚫</div>
        <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">
          دسترسی غیرمجاز
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          شما دسترسی لازم برای مشاهده این صفحه را ندارید.
          <br />
          فقط کاربران ادمین می‌توانند به پنل مدیریت دسترسی داشته باشند.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white transition-all hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}

export default function AdminPage() {
  // ✅ مرحله 1: بررسی احراز هویت
  const { user: telegramUser, loading, isAdmin } = useTelegram();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeProducts: "۰",
    newOrders: "۰",
    onlineUsers: "۰",
  });

  // ✅ مرحله 2: بررسی دسترسی ادمین
  useEffect(() => {
    if (!loading && !isAdmin) {
      console.warn("❌ Non-admin user tried to access admin panel");
      // می‌تونیم redirect کنیم یا صفحه access denied نشان دهیم
    }
  }, [loading, isAdmin]);

  const mainCards = [
    {
      href: "/admin/products",
      title: "مدیریت محصولات",
      description: "افزودن، ویرایش و حذف محصولات",
      icon: <CubeIcon className="mb-3 h-10 w-10" />,
      gradient: "from-cyan-500 to-blue-600",
      textColor: "text-blue-100",
    },
    {
      href: "/admin/orders",
      title: "مدیریت سفارشات",
      description: "بررسی و مدیریت سفارشات مشتریان",
      icon: <ClipboardDocumentListIcon className="mb-3 h-10 w-10" />,
      gradient: "from-emerald-500 to-green-600",
      textColor: "text-green-100",
    },
    {
      href: "/admin/users",
      title: "مدیریت کاربران",
      description: "مدیریت کاربران و سطوح دسترسی",
      icon: <UserGroupIcon className="mb-3 h-10 w-10" />,
      gradient: "from-purple-500 to-indigo-600",
      textColor: "text-purple-100",
    },
    {
      href: "/admin/settings",
      title: "تنظیمات",
      description: "تنظیمات سیستم و پیکربندی",
      icon: <ClipboardDocumentListIcon className="mb-3 h-10 w-10" />,
      gradient: "from-orange-500 to-red-600",
      textColor: "text-orange-100",
    },
  ];

  const statCards: StatCard[] = [
    {
      value: stats.activeProducts,
      label: "محصول فعال",
      color: "text-cyan-600",
      icon: <CubeIcon className="h-8 w-8 text-cyan-500 dark:text-cyan-400" />,
    },
    {
      value: stats.newOrders,
      label: "سفارش جدید",
      color: "text-emerald-600",
      icon: (
        <ClipboardDocumentListIcon className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
      ),
    },
    {
      value: stats.onlineUsers,
      label: "کاربر آنلاین",
      color: "text-orange-600",
      icon: (
        <UserGroupIcon className="h-8 w-8 text-orange-500 dark:text-orange-400" />
      ),
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setStats({
          activeProducts: "۲۴",
          newOrders: "۷",
          onlineUsers: "۵",
        });
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // ✅ مرحله 3: اگر درحال لودینگ است
  if (loading || isLoading) {
    return <LoadingSkeleton />;
  }

  // ✅ مرحله 4: اگر ادمین نیست - دسترسی غیرمجاز
  if (!isAdmin) {
    return <AccessDeniedPage />;
  }

  return (
    <div className="safe-area-top safe-area-bottom min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 px-4 py-12 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-800 dark:text-white">
            🛠️ پنل مدیریت
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            به پنل مدیریت خوش آمدید. از اینجا می‌توانید تمام بخش‌های سایت را
            مدیریت کنید.
          </p>
          {telegramUser && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              کاربر: {telegramUser.first_name} {telegramUser.last_name}
              {telegramUser.username && ` (@${telegramUser.username})`}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {mainCards.map((card, index) => (
            <AdminCard
              key={index}
              href={card.href}
              title={card.title}
              description={card.description}
              icon={card.icon}
              gradient={card.gradient}
              textColor={card.textColor}
            />
          ))}
        </div>

        <div className="mt-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-800 dark:text-white">
            📊 آمار کلی
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {statCards.map((item, idx) => (
              <StatCard
                key={idx}
                value={item.value}
                label={item.label}
                color={item.color}
                icon={item.icon}
              />
            ))}
          </div>
        </div>

        <div className="mt-16">
          <div className="rounded-3xl bg-white/80 p-8 shadow-lg backdrop-blur-md dark:bg-gray-800/80">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
              📋 فعالیت‌های اخیر
            </h2>
            <div className="space-y-4">
              {[
                {
                  action: "سفارش جدید",
                  user: "علی محمدی",
                  time: "۲ دقیقه پیش",
                  color: "text-green-600 dark:text-green-400",
                },
                {
                  action: "ویرایش محصول",
                  user: "مریم کریمی",
                  time: "۱۵ دقیقه پیش",
                  color: "text-blue-600 dark:text-blue-400",
                },
                {
                  action: "ثبت کاربر جدید",
                  user: "رضا احمدی",
                  time: "۱ ساعت پیش",
                  color: "text-purple-600 dark:text-purple-400",
                },
                {
                  action: "تغییر وضعیت سفارش",
                  user: "سارا نظری",
                  time: "۲ ساعت پیش",
                  color: "text-orange-600 dark:text-orange-400",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0 last:pb-0 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div
                      className={`h-3 w-3 rounded-full ${activity.color.replace("text", "bg").replace("600", "500").replace("dark:text", "")}`}
                    ></div>
                    <div>
                      <span className="font-medium text-gray-800 dark:text-white">
                        {activity.action}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {" "}
                        توسط{" "}
                      </span>
                      <span className="font-medium text-gray-800 dark:text-white">
                        {activity.user}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
