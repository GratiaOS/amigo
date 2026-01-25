import { useEffect, useMemo, useState } from "react";
import { modeById, type ModeId } from "./modes";
import { readMode, subscribeMode, writeMode } from "../storage/storage";

export function useMode() {
  const [modeId, setModeId] = useState<ModeId | null>(() => readMode());

  useEffect(() => {
    return subscribeMode(() => setModeId(readMode()));
  }, []);

  const mode = useMemo(() => modeById(modeId), [modeId]);

  const setMode = (next: ModeId) => {
    setModeId(next);
    writeMode(next);
  };

  return { modeId, mode, setMode };
}
