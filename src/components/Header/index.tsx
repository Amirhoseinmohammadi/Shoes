"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";

const Header = () => {
  const [sticky, setSticky] = useState(false);
  const { cartItems } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setSticky(window.scrollY >= 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`top-0 z-40 w-full transition ${
        sticky
          ? "fixed bg-white shadow dark:bg-gray-800"
          : "absolute bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Menu */}
        <nav className="hidden space-x-6 md:flex">
          {menuData.map(
            (item, idx) =>
              item.path && (
                <Link
                  key={idx}
                  href={item.path}
                  className={`font-medium ${
                    pathname === item.path
                      ? "text-primary dark:text-white"
                      : "hover:text-primary text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {item.title}
                </Link>
              ),
          )}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggler />
          <Link
            href="/cart"
            className="relative text-gray-700 dark:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>

            {cartItems.length > 0 && (
              <span className="bg-primary absolute -top-1 -right-2 rounded-full px-1 text-xs text-white">
                {cartItems.length}
              </span>
            )}
          </Link>
        </div>

        {/* Logo */}
        <Link href="/" className="text-lg font-bold text-black dark:text-white">
          Iran<span className="text-primary">Steps</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
