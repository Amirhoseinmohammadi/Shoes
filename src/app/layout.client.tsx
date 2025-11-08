"use client";

import { ReactNode, useMemo } from "react";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/contexts/ToastContext";
import { CartProvider } from "@/contexts/CartContext";
import PageTransition from "@/components/Common/PageTransition";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/Header/index"; // ✅ اضافه شد

interface RootLayoutClientProps {
  children: ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  // ✅ Memoize providers to prevent re-renders
  const providers = useMemo(
    () => (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <ToastProvider>
          <CartProvider>
            <main className="min-h-screen">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <BottomNavigation /> {/* ✅ اضافه شد */}
          </CartProvider>
        </ToastProvider>
      </ThemeProvider>
    ),
    [children],
  );

  return providers;
}
