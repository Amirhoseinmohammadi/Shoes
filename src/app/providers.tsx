"use client";

import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/contexts/CartContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" enableSystem={false} defaultTheme="dark">
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  );
}
