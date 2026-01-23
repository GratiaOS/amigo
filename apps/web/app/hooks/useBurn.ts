"use client";

import { useCallback, useState } from "react";

export type BurnStatus = "IDLE" | "BURNING" | "BURNED" | "ERROR";

export function useBurn(slug: string, baseUrl: string) {
  const [status, setStatus] = useState<BurnStatus>("IDLE");

  const triggerBurn = useCallback(async () => {
    if (!slug || status === "BURNING" || status === "BURNED") return;
    setStatus("BURNING");

    try {
      const res = await fetch(`${baseUrl}/api/burn/${slug}`, {
        method: "DELETE",
        keepalive: true,
      });
      if (!res.ok) {
        setStatus("ERROR");
        return;
      }
      setStatus("BURNED");
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
    } catch (err) {
      console.error("Burn failed:", err);
      setStatus("ERROR");
    }
  }, [baseUrl, slug, status]);

  return { status, triggerBurn };
}
