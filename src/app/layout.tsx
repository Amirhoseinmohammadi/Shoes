import Footer from "@/components/Footer";
import Header from "@/components/Header";
import "@/styles/index.css";
import { Providers } from "./providers";
import PageTransition from "@/components/Common/PageTransition";
import { ToastProvider } from "@/contexts/ToastContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iran Steps",
  description: "This is Home for kids shoes",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="fa" dir="rtl">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/rastikerdar/shabnam-font@v5.0.1/dist/font-face.css"
          rel="stylesheet"
          type="text/css"
        />
        {process.env.NODE_ENV === "production" && (
          <script
            src="https://telegram.org/js/telegram-web-app.js"
            async
            defer
          />
        )}
      </head>
      <body className="font-shabnam antialiased">
        <Providers>
          <ToastProvider>
            <Header />
            <main className="min-h-screen">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
