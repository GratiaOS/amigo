"use client";

import "./globals.css";
import { TranslationProvider, useTranslation } from "./i18n/useTranslation";
import { useEffect } from "react";

function HtmlLangSync({ children }: { children: React.ReactNode }) {
  const { lang } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return <>{children}</>;
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <head>
        <title>amigo.sh</title>
        <meta name="description" content="Transport de intentie. CLI + Room." />
      </head>
      <body>
        <TranslationProvider>
          <HtmlLangSync>{children}</HtmlLangSync>
        </TranslationProvider>
      </body>
    </html>
  );
}
