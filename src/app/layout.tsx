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
};

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
        {process.env.NODE_ENV === "production" && (
          <script src="https://telegram.org/js/telegram-web-app.js" async />
        )}
      </head>
      <body className="font-shabnam">
        <Providers>
          <ToastProvider>
            <Header />
            <PageTransition>{children}</PageTransition>
            <Footer />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
