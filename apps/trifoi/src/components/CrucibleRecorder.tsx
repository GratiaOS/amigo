import { useRef } from "react";
import { useCrucibleRecorder } from "../app/useCrucibleRecorder";

export function CrucibleRecorder() {
  const { state, energy, start, stop, burn, reset, audioUrl, canRecord } =
    useCrucibleRecorder();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const inc = Math.pow(energy, 1.6);
  const scale = 1 + energy * 0.35;

  return (
    <div className="pointer-events-auto absolute bottom-0 left-0 right-0 flex h-1/2 items-end justify-center pb-10">
      <div className="w-full max-w-md px-6">
        <div
          className="relative h-64 w-full select-none overflow-hidden rounded-t-[999px]"
          style={{
            touchAction: "none",
            transform: `scale(${scale})`,
            transformOrigin: "50% 100%",
            boxShadow: `0 0 ${24 + inc * 60}px rgba(255, 140, 0, ${0.12 + inc * 0.55})`,
          }}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            start();
          }}
          onPointerUp={() => stop()}
          onPointerCancel={() => stop()}
          onPointerLeave={() => stop()}
        >
          <div className="absolute inset-0 bg-black" />

          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 85%, rgba(255,160,0,${
                0.06 + inc * 0.4
              }) 0%, rgba(0,0,0,0) 55%)`,
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
              {state === "RECORDING"
                ? "TINE. SPUNE."
                : state === "RECORDED"
                ? "OK."
                : "TINE APASAT"}
            </span>
          </div>
        </div>

        {state === "RECORDED" && (
          <div className="mt-5 flex gap-3">
            <button
              className="h-12 flex-1 rounded-xl bg-white/10 font-mono uppercase tracking-widest text-white/90 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!audioUrl}
              onClick={() => {
                audioRef.current?.play().catch(() => {});
              }}
            >
              ASCULTA
            </button>
            <button
              className="h-12 flex-1 rounded-xl bg-orange-600/20 font-mono uppercase tracking-widest text-orange-200"
              onClick={() => burn()}
            >
              ARDE
            </button>
          </div>
        )}

        {state === "BURNED" && (
          <div className="mt-5">
            <button
              className="h-12 w-full rounded-xl bg-white/5 font-mono uppercase tracking-widest text-white/60"
              onClick={() => reset()}
            >
              INAPOI LA ⚜️
            </button>
          </div>
        )}

        {!canRecord && (
          <p className="mt-4 text-center text-[10px] uppercase tracking-[0.3em] text-white/30">
            MICROFON NEACCEPTAT
          </p>
        )}

        <audio ref={audioRef} src={audioUrl ?? undefined} preload="auto" />
      </div>
    </div>
  );
}
