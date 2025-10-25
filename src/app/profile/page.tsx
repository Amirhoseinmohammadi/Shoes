"use client";
import { useTelegram } from "@/hooks/useTelegram";
import Link from "next/link";
import Image from "next/image";
import ThemeToggler from "@/components/Header/ThemeToggler";

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  action?: () => void;
  color: string;
}

const ProfilePage = () => {
  const { user: telegramUser, loading } = useTelegram();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-4 pb-32 dark:bg-gray-900">
        <div className="mx-auto max-w-2xl px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-40 rounded-2xl bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-20 rounded-2xl bg-gray-300 dark:bg-gray-700"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-2xl bg-gray-300 dark:bg-gray-700"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!telegramUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 pb-32 dark:bg-gray-900">
        <div className="px-4 text-center">
          <svg
            className="mx-auto mb-2 h-12 w-12 text-gray-400 dark:text-gray-500"
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
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            لطفاً وارد شوید
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            برای دسترسی به پروفایل، از طریق تلگرام وارد شوید
          </p>
        </div>
      </div>
    );
  }

  const menuItems: MenuItem[] = [
    {
      id: "settings",
      icon: (
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      label: "تنظیمات",
      href: "/profile/settings",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      id: "notifications",
      icon: (
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
      label: "اطلاعات",
      href: "/profile/notifications",
      color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400",
    },
    {
      id: "orders",
      icon: (
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
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
      label: "سفارشات",
      href: "/order",
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    },
    {
      id: "wishlist",
      icon: (
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
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      label: "علاقه‌مندی‌ها",
      href: "/profile/wishlist",
      color: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    },
    {
      id: "admin",
      icon: (
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
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      ),
      label: "خروج",
      href: "/admin",
      color: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-32 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="rounded-full p-2 transition hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <svg
              className="h-6 w-6 text-gray-700 dark:text-gray-300"
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
            پروفایل
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggler />
          </div>
        </div>

        {/* Profile Card */}
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-white shadow-lg">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 opacity-10">
            <svg width="150" height="150" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="relative p-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              {telegramUser?.photo_url ? (
                <Image
                  src={telegramUser.photo_url}
                  alt={telegramUser?.first_name}
                  width={64}
                  height={64}
                  className="h-16 w-16 flex-shrink-0 rounded-full border-4 border-white/40 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-4 border-white/40 bg-white/20 text-2xl font-bold">
                  {telegramUser?.first_name?.charAt(0)}
                </div>
              )}

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold">
                  {telegramUser?.first_name} {telegramUser?.last_name || ""}
                </h2>
                {telegramUser?.username && (
                  <p className="mt-1 text-sm text-cyan-100">
                    @{telegramUser.username}
                  </p>
                )}

                {/* Badges */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    <span>👑</span>
                    کاربر ویژه
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    <span>🏷️</span>
                    تخفیف فعال
                  </span>
                </div>
              </div>

              {/* Points */}
              <div className="rounded-xl bg-white/20 p-3 text-center backdrop-blur-sm">
                <p className="text-xs font-medium text-cyan-100">امتیاز</p>
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-2xl font-black">۵۰</span>
                  <span className="text-lg">⭐</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item) =>
            item.href ? (
              <Link
                key={item.id}
                href={item.href}
                className="group flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-gray-800 dark:hover:shadow-gray-700/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`${item.color} rounded-full p-3`}>
                    {item.icon}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {item.label}
                  </span>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400 transition group-hover:text-gray-600 dark:group-hover:text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={item.action}
                className="group flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left shadow-sm transition hover:shadow-md dark:bg-gray-800 dark:hover:shadow-gray-700/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`${item.color} rounded-full p-3`}>
                    {item.icon}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {item.label}
                  </span>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400 transition group-hover:text-gray-600 dark:group-hover:text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ),
          )}
        </div>

        {/* Stats Section */}
        <div className="mt-8 rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 className="mb-4 font-bold text-gray-900 dark:text-white">آمار</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                0
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                سفارش
              </p>
            </div>
            <div className="border-r border-l border-gray-200 text-center dark:border-gray-700">
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                0
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                علاقه‌مندی
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                0
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                امتیاز
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
