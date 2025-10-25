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
  adminOnly?: boolean;
}

const ProfilePage = () => {
  const { user: telegramUser, loading, isAdmin } = useTelegram();

  if (loading)
    return (
      <div className="min-h-screen animate-pulse bg-gray-50 dark:bg-gray-900"></div>
    );

  if (!telegramUser)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            لطفاً وارد شوید
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            برای دسترسی به پروفایل، از طریق تلگرام وارد شوید
          </p>
        </div>
      </div>
    );

  const menuItems: MenuItem[] = [
    {
      id: "settings",
      icon: "⚙️",
      label: "تنظیمات",
      href: "/profile/settings",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      id: "notifications",
      icon: "🔔",
      label: "اطلاعات",
      href: "/profile/notifications",
      color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400",
    },
    {
      id: "orders",
      icon: "🛒",
      label: "سفارشات",
      href: "/order",
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    },
    {
      id: "wishlist",
      icon: "❤️",
      label: "علاقه‌مندی‌ها",
      href: "/profile/wishlist",
      color: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    },
    {
      id: "admin",
      icon: "🚪",
      label: "خروج",
      href: "/admin",
      color: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
      adminOnly: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-32 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            ←
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            پروفایل
          </h1>
          <ThemeToggler />
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 p-6 text-white shadow-lg">
          {telegramUser.photo_url ? (
            <Image
              src={telegramUser.photo_url}
              alt={telegramUser.first_name}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full border-4 border-white/40 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/40 bg-white/20 text-2xl font-bold">
              {telegramUser.first_name?.charAt(0)}
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
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {menuItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) =>
              item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm hover:shadow-md dark:bg-gray-800"
                >
                  <div className="flex items-center gap-4">
                    <div className={`${item.color} rounded-full p-3`}>
                      {item.icon}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {item.label}
                    </span>
                  </div>
                  →
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="group flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm hover:shadow-md dark:bg-gray-800"
                >
                  <div className="flex items-center gap-4">
                    <div className={`${item.color} rounded-full p-3`}>
                      {item.icon}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {item.label}
                    </span>
                  </div>
                  →
                </button>
              ),
            )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
