"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/contexts/ToastContext";
import { CartProvider } from "@/contexts/CartContext";
import PageTransition from "@/components/Common/PageTransition";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/Header";
import { usePathname } from "next/navigation";

interface RootLayoutClientProps {
  children: ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname();

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ToastProvider>
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <main className="flex-1">
              {/* key={pathname} ensures remount on route change */}
              <PageTransition key={pathname}>{children}</PageTransition>
            </main>
            <Footer />
            <BottomNavigation />
          </div>
        </CartProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
