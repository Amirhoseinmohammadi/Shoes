"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import "../styles/index.css";
import { Providers } from "./providers";
import PageTransition from "@/components/Common/PageTransition";
import { ToastProvider } from "@/contexts/ToastContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="fa">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/rastikerdar/shabnam-font@v5.0.1/dist/font-face.css"
          rel="stylesheet"
        />
      </head>
      <body className="font-shabnam bg-[#FCFCFC] dark:bg-black">
        <Providers>
          <ToastProvider>
            <Header />
            <PageTransition>{children}</PageTransition>
            <Footer />
            <ScrollToTop />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
