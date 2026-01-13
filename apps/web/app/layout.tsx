"use client";

import "./globals.css";
import { useTranslation } from "./i18n/useTranslation";
import { useEffect } from "react";

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { lang } = useTranslation();

  // Update html lang attribute when language changes
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <html lang={lang}>
      <head>
        <title>amigo.sh</title>
        <meta name="description" content="Transport de intentie. CLI + Room." />
      </head>
      <body>{children}</body>
    </html>
  );
}
