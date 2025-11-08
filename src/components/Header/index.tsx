"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import {
  HomeIcon,
  ShoppingCartIcon,
  BellIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useMemo } from "react";

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartItems } = useCart();

  // ✅ تعریف آیتم‌های ناوبری
  const navItems = useMemo(
    () => [
      { id: 0, href: "/", icon: HomeIcon, label: "خانه", badge: 0 },
      {
        id: 1,
        href: "/cart",
        icon: ShoppingCartIcon,
        label: "سبد خرید",
        badge: cartItems.length,
      },
      { id: 2, href: "/orders", icon: BellIcon, label: "سفارشات", badge: 0 },
      { id: 3, href: "/profile", icon: UserIcon, label: "پروفایل", badge: 0 },
    ],
    [cartItems.length],
  );

  // ✅ تشخیص آیتم فعال
  const getActiveItem = useCallback(() => {
    const currentItem = navItems.find((item) =>
      item.href === "/admin"
        ? pathname.startsWith("/admin")
        : pathname === item.href,
    );
    return currentItem?.id || 0;
  }, [pathname, navItems]);

  const activeId = getActiveItem();

  const navigate = useCallback(
    (href: string) => {
      console.log("🟠 Click detected:", href);
      console.log("📍 Current pathname:", pathname);

      try {
        if (typeof window !== "undefined" && window.Telegram?.WebApp) {
          console.log("📱 Telegram WebApp detected — navigating internally");
          router.push(href);
          (window.Telegram.WebApp as any).HapticFeedback?.impactOccurred(
            "light",
          );
        } else {
          console.log("💻 Normal browser detected");
          router.push(href);
        }

        console.log("✅ Navigation executed successfully");
      } catch (err) {
        console.error("❌ Navigation error:", err);
      }
    },
    [router, pathname],
  );

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 rounded-t-3xl bg-gray-200 pt-4 shadow-[0_-6px_20px_rgba(0,0,0,0.2)] backdrop-blur-md dark:bg-gray-800">
      <div className="relative flex items-center justify-around px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeId;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.href)}
              className={`relative flex flex-col items-center transition-all duration-300 ${
                isActive
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <div
                className={`relative flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? "h-14 w-14 scale-110 rounded-full bg-white text-cyan-600 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:bg-gray-700 dark:text-cyan-400 dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                    : "h-10 w-10 opacity-80 hover:scale-105 hover:opacity-100"
                }`}
              >
                <Icon className="h-6 w-6" />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`mt-1 text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                } ${
                  isActive
                    ? "text-cyan-600 dark:text-cyan-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
