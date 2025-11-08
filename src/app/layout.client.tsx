"use client";

import { ReactNode, useMemo } from "react";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/contexts/ToastContext";
import { CartProvider } from "@/contexts/CartContext";
import PageTransition from "@/components/Common/PageTransition";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
            <Header />
            <main className="min-h-screen">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </CartProvider>
        </ToastProvider>
      </ThemeProvider>
    ),
    [children],
  );

  return providers;
}
