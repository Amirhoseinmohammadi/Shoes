import type { Metadata } from "next";
import RootLayoutClient from "./layout.client";
import "@/styles/index.css";

export const metadata: Metadata = {
  title: "فروشگاه کفش",
  description: "فروشگاه آنلاین کفش با بهترین قیمت‌ها",
  icons: {
    icon: "/favicon.ico",
  },
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
        <script src="https://telegram.org/js/telegram-web-app.js" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className="font-shabnam antialiased">
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
