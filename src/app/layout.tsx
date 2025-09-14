"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import "../styles/index.css";
import { Providers } from "./providers";
import PageTransition from "@/components/Common/PageTransition";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="fe">
      <head />
      <body className="bg-[#FCFCFC] dark:bg-black">
        <Providers>
          <Header />
          <PageTransition>{children}</PageTransition>
          <Footer />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}
