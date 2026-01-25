import { useEffect, useMemo, useRef, useState } from "react";
import {
  makePresence,
  openPresenceChannel,
  PRESENCE_STORAGE_KEY,
  type Presence,
  type PresenceMessage,
  getPresenceId,
} from "./presence";
import { subscribeMode } from "../storage/storage";

const STALE_MS = 5 * 60 * 1000;
const HEARTBEAT_MS = 15_000;

export function usePresence() {
  const [peers, setPeers] = useState<Presence[]>([]);
  const myId = useMemo(() => getPresenceId(), []);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const upsert = (presence: Presence) => {
    setPeers((prev) => {
      const next = prev.filter((peer) => peer.id !== presence.id).concat(presence);
      const now = Date.now();
      return next
        .filter((peer) => now - peer.lastSeen < STALE_MS)
        .sort((a, b) => b.lastSeen - a.lastSeen);
    });
  };

  const broadcast = (presence: Presence) => {
    const message: PresenceMessage = { type: "presence:update", presence };
    channelRef.current?.postMessage(message);
    try {
      window.localStorage.setItem(
        PRESENCE_STORAGE_KEY,
        JSON.stringify({ ...message, sentAt: Date.now() })
      );
    } catch {
      // ignore storage failures
    }
  };

  useEffect(() => {
    const channel = openPresenceChannel();
    channelRef.current = channel;

    const publish = () => broadcast(makePresence());

    const onMessage = (event: MessageEvent) => {
      const msg = event.data as PresenceMessage | undefined;
      if (!msg) return;

      if (msg.type === "presence:update") {
        if (msg.presence.id !== myId) {
          upsert(msg.presence);
        }
      }

      if (msg.type === "presence:request") {
        publish();
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== PRESENCE_STORAGE_KEY || !event.newValue) return;
      try {
        const msg = JSON.parse(event.newValue) as PresenceMessage;
        if (msg.type === "presence:update" && msg.presence.id !== myId) {
          upsert(msg.presence);
        }
      } catch {
        // ignore parse failures
      }
    };

    publish();
    channel?.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);
    channel?.postMessage({ type: "presence:request" } satisfies PresenceMessage);

    const heartbeat = window.setInterval(publish, HEARTBEAT_MS);

    return () => {
      window.clearInterval(heartbeat);
      window.removeEventListener("storage", onStorage);
      channel?.removeEventListener("message", onMessage);
      channel?.close();
      channelRef.current = null;
    };
  }, [myId]);

  useEffect(() => {
    return subscribeMode(() => {
      broadcast(makePresence());
    });
  }, [myId]);

  return { peers };
}
