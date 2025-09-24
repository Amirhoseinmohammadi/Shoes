"use client";

import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/contexts/CartContext";
import { ToastProvider } from "@/contexts/ToastContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" enableSystem={false} defaultTheme="dark">
      <ToastProvider>
        <CartProvider>{children}</CartProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
