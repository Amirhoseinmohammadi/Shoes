"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/contexts/CartContext";
import { ToastProvider } from "@/contexts/ToastContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <ToastProvider>
        <CartProvider>{children}</CartProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
