import type { Mode } from "../app/modes";

type Props = {
  mode: Mode | null;
};

export function ModePill({ mode }: Props) {
  if (!mode) return null;

  const orbitClass =
    mode.id === "good"
      ? "trifoi-orbit trifoi-orbit--calm"
      : mode.id === "low"
        ? "trifoi-orbit trifoi-orbit--low"
        : "trifoi-orbit trifoi-orbit--panic";

  return (
    <div className="fixed right-4 top-4 flex flex-col gap-1 rounded-2xl border border-white/10 bg-black/60 px-3 py-2 text-xs tracking-[0.18em]">
      <div className="flex items-center gap-2">
        <span className={orbitClass} aria-hidden>
          <span className="trifoi-orbit__ring" />
          <span className="trifoi-orbit__spinner">
            <span className="trifoi-orbit__planet" />
          </span>
        </span>
        <span>{mode.label}</span>
      </div>
      <span className="text-[9px] uppercase tracking-[0.28em] text-white/50">
        Local only
      </span>
    </div>
  );
}
