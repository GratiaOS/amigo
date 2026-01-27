import { useCallback, useEffect, useRef, useState } from "react";

type CrucibleState = "IDLE" | "ARMED" | "RECORDING" | "RECORDED" | "BURNED";

function rmsFromTimeDomain(buf: Uint8Array) {
  let sum = 0;
  for (let i = 0; i < buf.length; i += 1) {
    const v = (buf[i] - 128) / 128;
    sum += v * v;
  }
  return Math.sqrt(sum / buf.length);
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function smooth(prev: number, next: number, a = 0.15) {
  return prev + (next - prev) * a;
}

export function useCrucibleRecorder() {
  const [state, setState] = useState<CrucibleState>("IDLE");
  const [energy, setEnergy] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastEnergyRef = useRef(0);

  const haptic = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const stopLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const teardownAudio = useCallback(() => {
    stopLoop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
  }, [stopLoop]);

  const start = useCallback(async () => {
    if (state === "RECORDING") return;

    setState("ARMED");
    haptic(20);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.85;
      source.connect(analyser);
      analyserRef.current = analyser;

      const buf = new Uint8Array(analyser.fftSize);

      setState("RECORDING");

      const tick = () => {
        const a = analyserRef.current;
        if (!a) return;

        a.getByteTimeDomainData(buf);
        const rms = rmsFromTimeDomain(buf);

        const normalized = clamp01((rms - 0.02) / 0.18);
        const prev = lastEnergyRef.current;
        const next = smooth(prev, normalized, 0.12);

        lastEnergyRef.current = next;
        setEnergy(next);

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setState("IDLE");
    }
  }, [haptic, state]);

  const stop = useCallback(() => {
    if (state !== "RECORDING") return;

    haptic(35);
    setState("RECORDED");

    const frozen = lastEnergyRef.current;
    setEnergy(frozen);

    setTimeout(() => {
      teardownAudio();
    }, 300);
  }, [haptic, state, teardownAudio]);

  const burn = useCallback(() => {
    haptic([30, 40, 30]);
    setState("BURNED");
    setEnergy(0);
  }, [haptic]);

  const reset = useCallback(() => {
    setState("IDLE");
    setEnergy(0);
  }, []);

  useEffect(() => {
    return () => teardownAudio();
  }, [teardownAudio]);

  return {
    state,
    energy,
    start,
    stop,
    burn,
    reset,
  };
}
