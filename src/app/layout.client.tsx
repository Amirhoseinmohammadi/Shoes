"use client";

import { ReactNode, Suspense, lazy } from "react";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/contexts/ToastContext";
import { CartProvider } from "@/contexts/CartContext";
import PageTransition from "@/components/Common/PageTransition";

const Footer = lazy(() => import("@/components/Footer"));
const BottomNavigation = lazy(() => import("@/components/Header"));

const NavigationSkeleton = () => (
  <div className="fixed right-0 bottom-0 left-0 h-20 animate-pulse bg-gray-200 dark:bg-gray-800" />
);

const FooterSkeleton = () => (
  <div className="h-40 animate-pulse bg-gray-200 dark:bg-gray-800" />
);

interface RootLayoutClientProps {
  children: ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider>
        <CartProvider>
          <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
            <main id="main-content" className="w-full flex-1">
              <PageTransition>{children}</PageTransition>
            </main>

            <Suspense fallback={<FooterSkeleton />}>
              <Footer />
            </Suspense>

            <Suspense fallback={<NavigationSkeleton />}>
              <BottomNavigation />
            </Suspense>
          </div>
        </CartProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
