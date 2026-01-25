import type { Mode, ModeId } from "../app/modes";

type Props = {
  modes: Mode[];
  activeId: ModeId | null;
  onSelect: (id: ModeId) => void;
};

export function ModeSelector({ modes, activeId, onSelect }: Props) {
  return (
    <div className="grid w-full grid-cols-3 gap-4">
      {modes.map((mode) => {
        const active = mode.id === activeId;
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onSelect(mode.id)}
            title={mode.desc}
            aria-pressed={active}
            className="flex flex-col items-center gap-2 rounded-2xl border border-transparent px-2 py-4 text-xs font-semibold tracking-[0.2em] transition"
            style={{
              background: active ? mode.color : "rgba(255,255,255,0.04)",
              color: active ? "#0b0b0a" : "#f2eee6",
              boxShadow: active
                ? `0 0 0 3px ${mode.ring}, 0 10px 20px rgba(0,0,0,0.4)`
                : "0 6px 14px rgba(0,0,0,0.35)",
            }}
          >
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full text-sm"
              style={{
                background: active ? "rgba(0,0,0,0.15)" : mode.color,
                color: active ? "#0b0b0a" : "#0b0b0a",
                boxShadow: active ? "inset 0 0 8px rgba(0,0,0,0.3)" : "none",
              }}
            >
              {mode.label.slice(0, 1)}
            </span>
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
