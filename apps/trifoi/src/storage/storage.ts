import type { ModeId } from "../app/modes";

const KEY = "trifoi:mode";
const CHANNEL = "trifoi:mode:sync";
const LOCAL_EVENT = "trifoi:mode";
let channel: BroadcastChannel | null = null;

function getChannel() {
  if (typeof window === "undefined") return null;
  if (typeof BroadcastChannel === "undefined") return null;
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL);
  }
  return channel;
}

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
    getChannel()?.postMessage(null);
    window.dispatchEvent(new Event(LOCAL_EVENT));
    return;
  }
  window.localStorage.setItem(KEY, next);
  getChannel()?.postMessage(next);
  window.dispatchEvent(new Event(LOCAL_EVENT));
}

export function subscribeMode(handler: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return;
    handler();
  };
  const onChannel = () => {
    handler();
  };
  const onLocal = () => {
    handler();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(LOCAL_EVENT, onLocal);
  const liveChannel = getChannel();
  liveChannel?.addEventListener("message", onChannel);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LOCAL_EVENT, onLocal);
    liveChannel?.removeEventListener("message", onChannel);
  };
}
