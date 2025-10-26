"use client";

import { useTelegram } from "@/hooks/useTelegram";
import Link from "next/link";
import Image from "next/image";
import ThemeToggler from "@/components/Header/ThemeToggler";
import React from "react";
import {
  FiSettings,
  FiBell,
  FiShoppingCart,
  FiHeart,
  FiLogOut,
  FiTool,
} from "react-icons/fi";

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
  const {
    user: telegramUser,
    loading,
    isAdmin,
    isAuthenticated,
    logout,
  } = useTelegram();

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
        <p className="mr-3 text-gray-700 dark:text-gray-300">
          در حال بارگذاری...
        </p>
      </div>
    );

  if (!telegramUser || !isAuthenticated)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="rounded-xl bg-white p-8 text-center shadow-2xl dark:bg-gray-800">
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            ⚠️ لطفاً وارد شوید
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            برای دسترسی به پروفایل، از طریق تلگرام وارد شوید.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-cyan-500 hover:underline"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    );

  const menuItems: MenuItem[] = [
    {
      id: "settings",
      icon: <FiSettings size={20} />,
      label: "تنظیمات",
      href: "/profile/settings",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      id: "notifications",
      icon: <FiBell size={20} />,
      label: "اطلاعات",
      href: "/profile/notifications",
      color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400",
    },
    {
      id: "orders",
      icon: <FiShoppingCart size={20} />,
      label: "سفارشات",
      href: "/order",
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
      label: "خروج از سیستم",
      action: logout,
      color: "bg-gray-100 text-gray-600 dark:bg-gray-700/20 dark:text-gray-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-32 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl px-4">
        {/* هدر */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="rounded-full p-2 text-gray-800 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700"
          ></Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            پروفایل
          </h1>
          <ThemeToggler />
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 p-6 text-white shadow-lg">
          {telegramUser.photo_url ? (
            <Image
              src={telegramUser.photo_url}
              alt={telegramUser.first_name || "User Photo"}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full border-4 border-white/40 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/40 bg-white/20 text-2xl font-bold">
              {telegramUser.first_name
                ? telegramUser.first_name.charAt(0)
                : "U"}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              {telegramUser.first_name} {telegramUser.last_name}
            </h2>
            {telegramUser.username && (
              <p className="mt-1 text-sm text-cyan-100">
                @{telegramUser.username}
              </p>
            )}
            {telegramUser.is_premium && (
              <span className="mt-1 inline-block rounded-full bg-yellow-400 px-2 text-xs font-medium text-black">
                ✨ Premium
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-2">
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
                  <span className="text-xl text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    ›
                  </span>
                </>
              );

              return item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="group flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
                >
                  {content}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
