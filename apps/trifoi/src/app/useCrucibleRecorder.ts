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
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [canRecord, setCanRecord] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioUrlRef = useRef<string | null>(null);
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

  const setAudioUrlSafe = useCallback((next: string | null) => {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = next;
    setAudioUrl(next);
  }, []);

  const teardownAudio = useCallback(() => {
    stopLoop();
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    chunksRef.current = [];
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
    setAudioUrlSafe(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      if (typeof MediaRecorder === "undefined") {
        setCanRecord(false);
      } else {
        setCanRecord(true);
        const preferredTypes = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/ogg;codecs=opus",
          "audio/ogg",
        ];
        const mimeType = preferredTypes.find((type) =>
          MediaRecorder.isTypeSupported(type)
        );
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        recorderRef.current = recorder;
        chunksRef.current = [];
        recorder.addEventListener("dataavailable", (event) => {
          if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
        });
        recorder.addEventListener("stop", () => {
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          if (blob.size > 0) {
            setAudioUrlSafe(URL.createObjectURL(blob));
          }
        });
        recorder.start();
      }

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
  }, [haptic, setAudioUrlSafe, state]);

  const stop = useCallback(() => {
    if (state !== "RECORDING") return;

    haptic(35);
    setState("RECORDED");

    const frozen = lastEnergyRef.current;
    setEnergy(frozen);

    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }

    setTimeout(() => {
      teardownAudio();
    }, 300);
  }, [haptic, state, teardownAudio]);

  const burn = useCallback(() => {
    haptic([30, 40, 30]);
    setState("BURNED");
    setEnergy(0);
    setAudioUrlSafe(null);
  }, [haptic, setAudioUrlSafe]);

  const reset = useCallback(() => {
    setState("IDLE");
    setEnergy(0);
    setAudioUrlSafe(null);
  }, [setAudioUrlSafe]);

  useEffect(() => {
    return () => teardownAudio();
  }, [teardownAudio]);

  useEffect(() => {
    return () => {
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  return {
    state,
    energy,
    audioUrl,
    canRecord,
    start,
    stop,
    burn,
    reset,
  };
}
