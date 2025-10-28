"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/contexts/ToastContext";
import { CartProvider } from "@/contexts/CartContext";
import PageTransition from "@/components/Common/PageTransition";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/styles/index.css";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html suppressHydrationWarning lang="fa" dir="rtl">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/rastikerdar/shabnam-font@v5.0.1/dist/font-face.css"
          rel="stylesheet"
          type="text/css"
        />
        <script src="https://telegram.org/js/telegram-web-app.js" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className="font-shabnam antialiased">
        <SessionProvider
          refetchInterval={5 * 60}
          refetchOnWindowFocus
          refetchWhenOffline={false}
        >
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
        </SessionProvider>
      </body>
    </html>
  );
}
