"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_LANG, dictFor, normalizeLang, tFromDict, type Lang } from "./i18n";
import { useSearchParams } from "next/navigation";

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

export function useTranslation() {
  const sp = useSearchParams();

  // RO-first initial (safe SSR/hydration)
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    // Precedence: query -> storage -> navigator -> default
    const q = normalizeLang(sp.get("lang"));
    if (q) {
      setLang(q);
      writeStoredLang(q);
      return;
    }

    const stored = readStoredLang();
    if (stored) {
      setLang(stored);
      return;
    }

    const browser = detectBrowserLang();
    setLang(browser);
    writeStoredLang(browser);
  }, [sp]);

  const dict = useMemo(() => dictFor(lang), [lang]);

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>) =>
      tFromDict(dict, key, vars);
  }, [dict]);

  // Helper: explicit set (for LangSwitch)
  const setLanguage = (next: Lang) => {
    setLang(next);
    writeStoredLang(next);

    // Update URL query param for shareability
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState({}, "", url.toString());
  };

  return { t, lang, setLanguage };
}
