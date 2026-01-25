export type ModeId = "good" | "low" | "survival";

export type Mode = {
  id: ModeId;
  label: string;
  desc: string;
  color: string;
  ring: string;
};

export const MODES: Mode[] = [
  {
    id: "good",
    label: "GOOD",
    desc: "Stable and clear",
    color: "#22c55e",
    ring: "rgba(34, 197, 94, 0.4)",
  },
  {
    id: "low",
    label: "LOW",
    desc: "Cautious and quiet",
    color: "#facc15",
    ring: "rgba(250, 204, 21, 0.45)",
  },
  {
    id: "survival",
    label: "SURVIVAL",
    desc: "Emergency mode",
    color: "#ef4444",
    ring: "rgba(239, 68, 68, 0.4)",
  },
];

export function modeById(id: ModeId | null) {
  return MODES.find((mode) => mode.id === id) ?? null;
}
