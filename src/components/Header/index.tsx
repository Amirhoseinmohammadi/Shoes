"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import {
  HomeIcon,
  ShoppingCartIcon,
  BellIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useMemo } from "react";

export default function BottomNavigation() {
  const pathname = usePathname();
  const { cartItems } = useCart();

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

  const activeId = useMemo(() => {
    const current = navItems.find((item) => {
      if (item.href === "/admin") return pathname.startsWith("/admin");
      if (item.href === "/") return pathname === "/";
      return pathname === item.href;
    });
    return current?.id ?? 0;
  }, [pathname, navItems]);

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 rounded-t-3xl bg-gray-200 pt-5 pb-3 shadow-[0_-6px_20px_rgba(0,0,0,0.2)] backdrop-blur-md dark:bg-gray-800">
      <div className="relative flex items-center justify-around px-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeId;

          return (
            <Link
              key={item.id}
              href={item.href}
              prefetch={false}
              replace
              scroll={false}
              onClick={() =>
                (
                  window.Telegram?.WebApp as any
                )?.HapticFeedback?.impactOccurred("light")
              }
              className={`relative flex flex-col items-center transition-all duration-300 ${
                isActive
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
              style={{ minWidth: "70px", minHeight: "70px" }}
            >
              <div
                className={`relative flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? "h-16 w-16 scale-110 rounded-full bg-white text-cyan-600 shadow-[0_0_18px_rgba(0,0,0,0.15)] dark:bg-gray-700 dark:text-cyan-400 dark:shadow-[0_0_18px_rgba(0,0,0,0.35)]"
                    : "h-12 w-12 opacity-90 hover:scale-110 hover:opacity-100"
                }`}
              >
                <Icon className="h-7 w-7" />
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
