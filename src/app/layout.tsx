"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
// import { Inter } from "next/font/google";
import "../styles/index.css";
// import localFont from "next/font/local";
// const shabnamFont = localFont({
//   src: [
//     {
//       path: "../public/fonts/Shabnam-Light.woff2",
//       weight: "300",
//       style: "normal",
//     },
//     {
//       path: "../public/fonts/Shabnam-Regular.woff2",
//       weight: "400",
//       style: "normal",
//     },
//   ],
//   variable: "--font-shabnam",
// });
// const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.js. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />

      <body className={`bg-[#FCFCFC] dark:bg-black`}>
        <Providers>
          <Header />
          {children}
          <Footer />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}

import { Providers } from "./providers";
