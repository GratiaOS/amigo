import type { ModeId } from "../app/modes";

const KEY = "trifoi:mode";

export function readMode(): ModeId | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  if (raw === "good" || raw === "low" || raw === "survival") return raw;
  return null;
}

export function writeMode(next: ModeId | null) {
  if (typeof window === "undefined") return;
  if (!next) {
    window.localStorage.removeItem(KEY);
    return;
  }
  window.localStorage.setItem(KEY, next);
}

export function subscribeMode(handler: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return;
    handler();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}
