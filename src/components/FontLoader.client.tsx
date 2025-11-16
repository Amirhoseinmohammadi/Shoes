// 📁 src/components/FontLoader.client.tsx
"use client";

import { ReactEventHandler } from "react";

const SHABNAM_FONT_CSS_URL =
  "https://cdn.jsdelivr.net/gh/rastikerdar/shabnam-font@v5.0.1/dist/font-face.css";

const handleLinkLoad: ReactEventHandler<HTMLLinkElement> = (e) => {
  const linkElement = e.target as HTMLLinkElement;
  linkElement.media = "all"; // منطق onLoad برای جلوگیری از مسدود شدن رندر
};

export default function FontLoader() {
  return (
    <>
      <link
        href={SHABNAM_FONT_CSS_URL}
        rel="stylesheet"
        media="print"
        onLoad={handleLinkLoad}
      />
    </>
  );
}
