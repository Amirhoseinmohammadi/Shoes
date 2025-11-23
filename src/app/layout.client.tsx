"use client";

import { ReactNode, Suspense, lazy, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/contexts/ToastContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import PageTransition from "@/components/Common/PageTransition";

const Footer = lazy(() => import("@/components/Footer"));
const BottomNavigation = lazy(() => import("@/components/Header"));

const NavigationSkeleton = () => (
  <div className="fixed right-0 bottom-0 left-0 z-50 h-24 animate-pulse bg-gray-200 dark:bg-gray-800" />
);

const FooterSkeleton = () => (
  <div className="h-40 animate-pulse bg-gray-200 dark:bg-gray-800" />
);

interface RootLayoutClientProps {
  children: ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
              <main id="main-content" className="w-full flex-1 pb-24">
                <PageTransition>{children}</PageTransition>
              </main>

              <Suspense fallback={<FooterSkeleton />}>
                <Footer />
              </Suspense>

              <div className="fixed right-0 bottom-0 left-0 z-50 w-full">
                <Suspense fallback={<NavigationSkeleton />}>
                  <BottomNavigation />
                </Suspense>
              </div>
            </div>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
