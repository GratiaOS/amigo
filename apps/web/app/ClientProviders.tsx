"use client";

import { useEffect } from "react";
import { TranslationProvider, useTranslation } from "./i18n/useTranslation";

function HtmlLangSync({ children }: { children: React.ReactNode }) {
  const { lang } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return <>{children}</>;
}

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TranslationProvider>
      <HtmlLangSync>{children}</HtmlLangSync>
    </TranslationProvider>
  );
}
