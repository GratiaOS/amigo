import ro from "./ro.json";
import en from "./en.json";
import es from "./es.json";

export type Lang = "ro" | "en" | "es";
export const DEFAULT_LANG: Lang = "ro";
export const SUPPORTED_LANGS: Lang[] = ["ro", "en", "es"];

const DICTS: Record<Lang, Record<string, string>> = { ro, en, es };

export function normalizeLang(input?: string | null): Lang | null {
  if (!input) return null;
  const raw = String(input).toLowerCase().trim();
  const base = raw.split(/[-_]/)[0]; // ro-RO -> ro, en-US -> en
  if (SUPPORTED_LANGS.includes(base as Lang)) return base as Lang;
  return null;
}

export function dictFor(lang: Lang): Record<string, string> {
  return DICTS[lang] ?? DICTS[DEFAULT_LANG];
}

export function tFromDict(
  dict: Record<string, string>,
  key: string,
  vars?: Record<string, string | number>
): string {
  const template = dict[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
