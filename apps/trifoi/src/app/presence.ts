import type { ModeId } from "./modes";
import { readMode } from "../storage/storage";

export type Presence = {
  id: string;
  name: string;
  mode: ModeId;
  lastSeen: number;
};

export type PresenceMessage =
  | { type: "presence:update"; presence: Presence; sentAt?: number }
  | { type: "presence:request"; sentAt?: number };

const CHANNEL = "trifoi:presence";
const ID_KEY = "trifoi:presence:id";
const NAME_KEY = "trifoi:presence:name";
export const PRESENCE_STORAGE_KEY = "trifoi:presence:last";

function randomId() {
  return `id-${Math.random().toString(36).slice(2, 10)}`;
}

function getOrCreate(key: string, make: () => string) {
  if (typeof window === "undefined") return make();
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const next = make();
  window.localStorage.setItem(key, next);
  return next;
}

export function getPresenceId() {
  return getOrCreate(ID_KEY, () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return randomId();
  });
}

export function getPresenceName() {
  return getOrCreate(NAME_KEY, () => "You");
}

export function setPresenceName(name: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NAME_KEY, name);
}

export function makePresence(): Presence {
  return {
    id: getPresenceId(),
    name: getPresenceName(),
    mode: readMode() ?? "good",
    lastSeen: Date.now(),
  };
}

export function openPresenceChannel() {
  if (typeof window === "undefined") return null;
  if (typeof BroadcastChannel === "undefined") return null;
  try {
    return new BroadcastChannel(CHANNEL);
  } catch {
    return null;
  }
}
