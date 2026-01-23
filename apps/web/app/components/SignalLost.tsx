"use client";

import type { CSSProperties } from "react";
import { useTranslation } from "../i18n/useTranslation";

const NOISE_BG =
  "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' ensuresStitching='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function SignalLost() {
  const { t } = useTranslation();

  return (
    <main style={styles.shell}>
      <div style={styles.noise} aria-hidden />
      <div style={styles.core}>
        <div style={styles.icon} aria-hidden>
          ⏚
        </div>
        <div style={styles.title}>{t("room.signal_lost.title")}</div>
        <div style={styles.subtitle}>{t("room.signal_lost.subtitle")}</div>
      </div>
      <div style={styles.code}>{t("room.signal_lost.code")}</div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  shell: {
    minHeight: "100vh",
    background: "#0a0a09",
    color: "#3d4035",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    textAlign: "center",
  },
  noise: {
    position: "absolute",
    inset: 0,
    opacity: 0.12,
    backgroundImage: `url("${NOISE_BG}")`,
    mixBlendMode: "overlay",
    pointerEvents: "none",
  },
  core: {
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    fontSize: 48,
    color: "#2a2b26",
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#c04000",
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#5c6055",
  },
  code: {
    position: "absolute",
    bottom: 24,
    fontSize: 10,
    letterSpacing: "0.12em",
    color: "#2a2b26",
  },
};
