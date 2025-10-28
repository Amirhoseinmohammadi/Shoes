"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggler from "@/components/Header/ThemeToggler";
import React, { useEffect } from "react";
import {
  FiSettings,
  FiBell,
  FiShoppingCart,
  FiHeart,
  FiLogOut,
  FiTool,
  FiUser,
} from "react-icons/fi";
import { useTelegram } from "@/hooks/useTelegram";

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  action?: () => void;
  color: string;
  adminOnly?: boolean;
}

const ProfilePage = () => {
  const { user: telegramUser, loading, isTelegram } = useTelegram();
  const router = useRouter();

  // اگر از تلگرام باز نشده بود، هدایت به صفحه اصلی
  useEffect(() => {
    if (!loading && !telegramUser) {
      router.push("/");
    }
  }, [loading, telegramUser, router]);

  const handleLogout = () => {
    // چون احراز هویت واقعی نداریم، فقط کاربر رو برمی‌گردونیم به صفحه اصلی
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-gray-700 dark:text-gray-300">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!telegramUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="rounded-xl bg-white p-8 text-center shadow-2xl dark:bg-gray-800">
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            ⚠️ لطفاً از طریق تلگرام وارد شوید
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            این صفحه فقط در حالت وب‌اپ تلگرام فعال است.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-cyan-500 px-6 py-2 text-white transition hover:bg-cyan-600"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    );
  }

  const user = telegramUser;
  const isAdmin = user.id.toString() === process.env.NEXT_PUBLIC_ADMIN_USER_ID;

  const menuItems: MenuItem[] = [
    {
      id: "profile",
      icon: <FiUser size={20} />,
      label: "اطلاعات حساب",
      href: "/profile/edit",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      id: "orders",
      icon: <FiShoppingCart size={20} />,
      label: "سفارشات من",
      href: "/orders",
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    },
    {
      id: "wishlist",
      icon: <FiHeart size={20} />,
      label: "علاقه‌مندی‌ها",
      href: "/profile/wishlist",
      color: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    },
    {
      id: "notifications",
      icon: <FiBell size={20} />,
      label: "اعلان‌ها",
      href: "/profile/notifications",
      color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400",
    },
    {
      id: "settings",
      icon: <FiSettings size={20} />,
      label: "تنظیمات",
      href: "/profile/settings",
      color: "bg-gray-100 text-gray-600 dark:bg-gray-700/20 dark:text-gray-400",
    },
    {
      id: "admin",
      icon: <FiTool size={20} />,
      label: "پنل مدیریت",
      href: "/admin",
      color: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
      adminOnly: true,
    },
    {
      id: "logout",
      icon: <FiLogOut size={20} />,
      label: "خروج",
      action: handleLogout,
      color:
        "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    },
  ];

  return (
    <div className="safe-area-bottom min-h-screen bg-gray-50 pt-4 pb-32 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl px-4">
        {/* هدر */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="rounded-full p-2 text-gray-800 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            پروفایل من
          </h1>
          <ThemeToggler />
        </div>

        {/* کارت اطلاعات کاربر */}
        <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-600 p-6 text-white shadow-lg">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/40 bg-white/20 text-2xl font-bold">
            {user.first_name?.charAt(0) || "U"}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">
              {user.first_name} {user.last_name || ""}
            </h2>
            {user.username && (
              <p className="mt-1 text-sm text-cyan-100">@{user.username}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/20 px-2 py-1 text-xs">
                ID: {user.id}
              </span>
              {isAdmin && (
                <span className="rounded-full bg-yellow-400 px-2 py-1 text-xs font-medium text-black">
                  ✨ ادمین
                </span>
              )}
              <span className="rounded-full bg-white/20 px-2 py-1 text-xs">
                کاربر تلگرام
              </span>
            </div>
          </div>
        </div>

        {/* منو */}
        <div className="mt-6 space-y-3">
          {menuItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => {
              const content = (
                <>
                  <div className="flex items-center gap-4">
                    <div className={`${item.color} rounded-full p-3`}>
                      {item.icon}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xl text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    ›
                  </span>
                </>
              );

              return item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="group flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
                >
                  {content}
                </button>
              );
            })}
        </div>

        {/* اطلاعات اضافی */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
            اطلاعات حساب
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                شناسه کاربری:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {user.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">نام:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {user.first_name} {user.last_name || ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                نام کاربری:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                @{user.username || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">وضعیت:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                فعال
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
