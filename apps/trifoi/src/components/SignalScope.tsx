import { useEffect, useMemo, useState } from "react";
import type { ModeId } from "../app/modes";

const WIDTH = 280;
const HEIGHT = 44;
const POINTS = 48;
const VANISH_THRESHOLD = 0.03;
const BROKEN_THRESHOLD = 0.35;
const INTERVAL_MS = 120;

const JITTER_BASE: Record<ModeId, number> = {
  good: 0.05,
  low: 0.2,
  survival: 0.45,
};

type Paths = {
  main: string;
  red: string;
  blue: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildPaths(jitter: number, broken: boolean): Paths {
  const amplitude = HEIGHT * jitter;
  const center = HEIGHT / 2;
  const step = WIDTH / (POINTS - 1);
  const dropoutChance = broken ? clamp(jitter * 0.5, 0.08, 0.28) : 0;

  let main = "";
  let red = "";
  let blue = "";

  for (let i = 0; i < POINTS; i += 1) {
    const x = i * step;
    const wave = Math.sin((i / POINTS) * Math.PI * 2) * amplitude * 0.15;
    const noise = (Math.random() * 2 - 1) * amplitude;
    const y = center + wave + noise;

    const breakHere = broken && Math.random() < dropoutChance;
    const cmd = i === 0 || breakHere ? "M" : "L";

    main += `${cmd}${x.toFixed(2)},${y.toFixed(2)} `;
    red += `${cmd}${(x + 0.9).toFixed(2)},${(y - 0.6).toFixed(2)} `;
    blue += `${cmd}${(x - 0.8).toFixed(2)},${(y + 0.6).toFixed(2)} `;
  }

  return { main, red, blue };
}

type Props = {
  modeId: ModeId | null;
  damping?: number;
};

export function SignalScope({ modeId, damping = 0 }: Props) {
  const jitterBase = modeId ? JITTER_BASE[modeId] : 0.05;
  const jitter = jitterBase * (1 - clamp(damping, 0, 1));
  const broken = jitter > BROKEN_THRESHOLD;
  const shouldRender = jitter >= VANISH_THRESHOLD;

  const stroke = useMemo(() => {
    if (jitter < 0.1) return "rgba(242,238,230,0.35)";
    if (jitter < 0.3) return "rgba(242,238,230,0.5)";
    return "rgba(242,238,230,0.7)";
  }, [jitter]);

  const [paths, setPaths] = useState<Paths>(() => buildPaths(jitter, broken));

  useEffect(() => {
    if (!shouldRender) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setPaths(buildPaths(jitter, broken));
      return;
    }

    let timer: number | undefined;
    const tick = () => {
      setPaths(buildPaths(jitter, broken));
      timer = window.setTimeout(tick, INTERVAL_MS);
    };
    tick();

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [jitter, broken, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div className="mx-auto w-full max-w-md rounded-full border border-white/10 bg-white/5 px-4 py-2">
      <svg
        width="100%"
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        aria-hidden
      >
        {broken ? (
          <>
            <path d={paths.red} stroke="rgba(255,99,99,0.35)" strokeWidth="1" fill="none" />
            <path d={paths.blue} stroke="rgba(120,160,255,0.35)" strokeWidth="1" fill="none" />
          </>
        ) : null}
        <path d={paths.main} stroke={stroke} strokeWidth="1.2" fill="none" />
      </svg>
    </div>
  );
}
