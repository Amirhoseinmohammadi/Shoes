"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ShoppingCartIcon,
  BellIcon,
  UserIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export default function BottomNavigation() {
  const pathname = usePathname();
  const [cartItems] = useState(3);

  const navItems = [
    { id: 0, href: "/", icon: HomeIcon, label: "خانه", badge: 0 },
    {
      id: 1,
      href: "/cart",
      icon: ShoppingCartIcon,
      label: "سبد خرید",
      badge: cartItems,
    },
    { id: 2, href: "/order", icon: BellIcon, label: "سفارشات", badge: 0 },
    { id: 3, href: "/profile", icon: UserIcon, label: "پروفایل", badge: 0 },
    { id: 4, href: "/admin", icon: Cog6ToothIcon, label: "مدیریت", badge: 0 },
  ];

  const getActiveItem = () => {
    const currentItem = navItems.find((item) =>
      item.href === "/admin"
        ? pathname.startsWith("/admin")
        : pathname === item.href,
    );
    return currentItem?.id || 0;
  };

  const activeId = getActiveItem();

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 rounded-t-3xl bg-gradient-to-t from-cyan-700 to-cyan-500 pt-4 shadow-[0_-6px_20px_rgba(0,0,0,0.2)] backdrop-blur-md">
      <div className="relative flex items-center justify-around px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeId;

          return (
            <a
              key={item.id}
              href={item.href}
              className={`relative flex flex-col items-center transition-all duration-300 ${
                isActive ? "text-white" : "text-cyan-100"
              }`}
            >
              <div
                className={`relative flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? "h-14 w-14 scale-110 rounded-full bg-white text-cyan-600 shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                    : "h-10 w-10 text-white opacity-80 hover:scale-105 hover:opacity-100"
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
                }`}
              >
                {item.label}
              </span>
            </a>
          );
        })}
      </div>

      <style jsx>{`
        a {
          transform-origin: center;
        }
        a.active {
          transform: translateY(-8px);
        }
      `}</style>
    </div>
  );
}
