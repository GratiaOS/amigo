import type { Mode } from "../app/modes";

type Props = {
  mode: Mode | null;
};

export function ModePill({ mode }: Props) {
  if (!mode) return null;

  return (
    <div className="fixed right-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-2 text-xs tracking-[0.18em]">
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: mode.color, boxShadow: `0 0 8px ${mode.ring}` }}
      />
      <span>{mode.label}</span>
    </div>
  );
}
