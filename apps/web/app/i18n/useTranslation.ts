"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_LANG, dictFor, normalizeLang, tFromDict, type Lang } from "./i18n";

const LS_KEY = "amigo:lang";

function detectBrowserLang(): Lang {
  // navigator.language is like "en-US" / "ro-RO"
  const nav = typeof navigator !== "undefined" ? navigator.language : null;
  return normalizeLang(nav) ?? DEFAULT_LANG;
}

function readStoredLang(): Lang | null {
  try {
    const v = localStorage.getItem(LS_KEY);
    return normalizeLang(v);
  } catch {
    return null;
  }
}

function writeStoredLang(lang: Lang) {
  try {
    localStorage.setItem(LS_KEY, lang);
  } catch {
    // ignore
  }
}

type TranslationContextValue = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  lang: Lang;
  setLanguage: (next: Lang) => void;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchLang = normalizeLang(searchParams?.get("lang"));
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    if (searchLang) {
      if (searchLang !== lang) {
        setLang(searchLang);
      }
      writeStoredLang(searchLang);
      return;
    }

    const stored = readStoredLang();
    if (stored) {
      if (stored !== lang) {
        setLang(stored);
      }
      return;
    }

    const browser = detectBrowserLang();
    setLang(browser);
    writeStoredLang(browser);
  }, [searchLang, lang]);

  const dict = useMemo(() => dictFor(lang), [lang]);

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>) =>
      tFromDict(dict, key, vars);
  }, [dict]);

  const setLanguage = (next: Lang) => {
    setLang(next);
    writeStoredLang(next);

    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    router.replace(`${url.pathname}${url.search}${url.hash}`);
  };

  const value = useMemo(
    () => ({
      t,
      lang,
      setLanguage
    }),
    [t, lang]
  );

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within TranslationProvider");
  }
  return ctx;
}
