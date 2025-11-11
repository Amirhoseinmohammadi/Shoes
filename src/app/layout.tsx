import type { Metadata, Viewport } from "next";
import RootLayoutClient from "./layout.client";
import "@/styles/index.css";
import Script from "next/script";

// ✅ SEO Metadata
export const metadata: Metadata = {
  title: "فروشگاه کفش - Iran Steps",
  description: "فروشگاه آنلاین کفش با بهترین قیمت‌ها و کیفیت تضمین‌شده",
  applicationName: "Iran Steps",
  authors: [{ name: "Iran Steps Team" }],
  creator: "Iran Steps",
  keywords: ["کفش", "کفش ورزشی", "کفش اصل", "خرید آنلاین", "فروشگاه"],

  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://shoes-tau-self.vercel.app",
    siteName: "فروشگاه کفش",
    title: "فروشگاه کفش - Iran Steps",
    description: "فروشگاه آنلاین کفش با بهترین قیمت‌ها",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Iran Steps",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "فروشگاه کفش",
    description: "فروشگاه آنلاین کفش با بهترین قیمت‌ها",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },

  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
};

export async function generateStaticParams() {
  return [{ locale: "fa" }];
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      lang="fa"
      dir="rtl"
      className="scroll-smooth"
    >
      <head>
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/shabnam-font@v5.0.1/dist/Shabnam.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        <link rel="dns-prefetch" href="https://api.telegram.org" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />

        <link
          href="https://cdn.jsdelivr.net/gh/rastikerdar/shabnam-font@v5.0.1/dist/font-face.css"
          rel="stylesheet"
          media="print"
          onLoad="this.media='all'"
        />

        <noscript>
          <link
            href="https://cdn.jsdelivr.net/gh/rastikerdar/shabnam-font@v5.0.1/dist/font-face.css"
            rel="stylesheet"
          />
        </noscript>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 
                              (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>

      <body className="font-shabnam bg-white antialiased transition-colors dark:bg-gray-900">
        <a href="#main-content" className="sr-only focus:not-sr-only">
          رفتن به محتوای اصلی
        </a>

        <RootLayoutClient>{children}</RootLayoutClient>

        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="lazyOnload"
          onLoad={() => {
            console.log("✅ Telegram WebApp loaded");
          }}
        />
      </body>
    </html>
  );
}
