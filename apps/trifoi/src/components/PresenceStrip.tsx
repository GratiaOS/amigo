import { modeById } from "../app/modes";
import { usePresence } from "../app/usePresence";

export function PresenceStrip() {
  const { peers } = usePresence();

  if (!peers.length) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      {peers.slice(0, 6).map((peer) => {
        const mode = modeById(peer.mode);
        const color = mode?.color ?? "rgba(255,255,255,0.2)";
        const ring = mode?.ring ?? "rgba(255,255,255,0.35)";
        return (
          <div
            key={peer.id}
            title={`${peer.name} • ${mode?.label ?? "Unknown"}`}
            className="h-8 w-8 rounded-full border border-white/10 bg-black/40"
          >
            <div
              className="mx-auto mt-[9px] h-3 w-3 rounded-full"
              style={{ background: color, boxShadow: `0 0 10px ${ring}` }}
            />
          </div>
        );
      })}
    </div>
  );
}
