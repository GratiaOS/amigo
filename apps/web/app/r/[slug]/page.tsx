"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import { LangSwitch } from "../../i18n/LangSwitch";

type Props = { params: { slug: string } };
type Resolve = {
  url?: string | null;
  note?: string | null;
  expires_at?: number | null;
  reply_to?: string | null;
  emoji?: string | null;
};

function firstGrapheme(input?: string | null): string | null {
  if (!input) return null;
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    const it = seg.segment(input)[Symbol.iterator]();
    const first = it.next().value;
    return first?.segment ?? null;
  }
  return Array.from(input)[0] ?? null;
}

export default function Room({ params }: Props) {
  const { t, lang } = useTranslation();
  const base = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  const [data, setData] = useState<Resolve | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "gone" | "burned">("loading");
  const [auto, setAuto] = useState(false);
  const [mounted, setMounted] = useState(false);

  const ms = 3600; // Breathing cycle (mai somatic)
  const redirectTo = data?.url ?? null;

  // Detect auto mode after mount (avoids hydration mismatch)
  useEffect(() => {
    setMounted(true);
    const v = new URLSearchParams(window.location.search).get("auto");
    setAuto(v === "1" || v === "true");
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`${base}/api/resolve/${params.slug}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("not-found");
        return (await r.json()) as Resolve;
      })
      .then((json) => {
        if (!active) return;
        setData(json);
        setStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setStatus("gone");
      });
    return () => {
      active = false;
    };
  }, [base, params.slug]);

  // Proof of Breath: Commit journey before redirect
  const commitAndGo = async () => {
    if (!data) return;

    // Fire & forget: Ping backend to increment views (keepalive ensures it completes)
    try {
      const res = await fetch(`${base}/api/commence/${params.slug}`, {
        method: "POST",
        keepalive: true, // Critical: Request survives page navigation
      });
      if (!res.ok && !data.url) {
        setStatus("gone");
        return;
      }
    } catch (e) {
      console.error("Ghost walk:", e);
      if (!data.url) {
        setStatus("gone");
        return;
      }
      window.location.href = data.url;
      return;
    }

    if (!data.url) {
      setStatus("burned");
      return;
    }

    // Journey begins
    window.location.href = data.url;
  };

  const burnNow = async () => {
    if (!data) return;
    try {
      const res = await fetch(`${base}/api/commence/${params.slug}`, {
        method: "POST",
        keepalive: true,
      });
      if (!res.ok) {
        setStatus("gone");
        return;
      }
    } catch (e) {
      console.error("Burn failed:", e);
      setStatus("gone");
      return;
    }
    setStatus("burned");
  };

  const replyNow = async () => {
    if (!data) return;
    try {
      const res = await fetch(`${base}/api/commence/${params.slug}`, {
        method: "POST",
        keepalive: true,
      });
      if (!res.ok) {
        setStatus("gone");
        return;
      }
    } catch (e) {
      console.error("Reply burn failed:", e);
      setStatus("gone");
      return;
    }

    const qs = new URLSearchParams();
    qs.set("reply_to", params.slug);
    if (lang) {
      qs.set("lang", lang);
    }
    window.location.href = `/?${qs.toString()}`;
  };

  const shouldAuto = auto;

  // Auto-open after breath cycle (ritual mode) if ?auto=1
  useEffect(() => {
    if (!shouldAuto || status !== "ready" || !data) return;
    const timer = setTimeout(() => {
      commitAndGo();
    }, ms);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAuto, status, redirectTo, ms]);

  if (status === "gone") {
    return (
      <main style={styles.main}>
        <div style={{ ...styles.card, position: "relative" }}>
          <LangSwitch />

          <p style={{ opacity: 0.85, marginBottom: 14, fontSize: 16, textAlign: "center" }}>
            {t("room.gone.title")}
          </p>
          <p style={{ opacity: 0.65, lineHeight: 1.6, fontSize: 14, textAlign: "center", color: "var(--text-muted)" }}>
            {t("room.gone.body1")}
          </p>
          <p style={{ opacity: 0.65, lineHeight: 1.6, fontSize: 14, marginTop: 10, textAlign: "center", color: "var(--text-muted)" }}>
            {t("room.gone.body2")}
          </p>
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <a href="/" style={styles.shellLink}>{t("room.gone.cta")}</a>
          </div>
        </div>
      </main>
    );
  }

  if (status === "burned") {
    return (
      <main style={styles.main}>
        <div style={{ ...styles.card, position: "relative" }}>
          <LangSwitch />

          <p style={{ opacity: 0.85, marginBottom: 14, fontSize: 16, textAlign: "center" }}>
            {t("room.burned.title")}
          </p>
          <p style={{ opacity: 0.65, lineHeight: 1.6, fontSize: 14, textAlign: "center", color: "var(--text-muted)" }}>
            {t("room.burned.body1")}
          </p>
          <p style={{ opacity: 0.65, lineHeight: 1.6, fontSize: 14, marginTop: 10, textAlign: "center", color: "var(--text-muted)" }}>
            {t("room.burned.body2")}
          </p>
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <a href="/" style={styles.shellLink}>{t("room.burned.cta")}</a>
          </div>
        </div>
      </main>
    );
  }

  const signet = firstGrapheme(data?.emoji);
  const senderText = signet
    ? t("room.sender.with_signet", { signet })
    : t("room.sender.generic");

  // VARIANTA 2: Personalizat (decomentează linia de jos ca să activezi)
  // const senderText = t("room.sender.bear");

  return (
    <main style={styles.main}>
      <div style={{ ...styles.card, position: "relative" }}>
        <LangSwitch />

        <p style={{ opacity: 0.8, marginBottom: 16, fontSize: 15, textAlign: "center" }}>
          {senderText}
        </p>

        <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto" }}>
          <div style={styles.breathCore} />
          <div style={{ ...styles.breathRing, animationDuration: `${ms}ms` }} />
          <div style={{ ...styles.breathRing, animationDuration: `${ms}ms`, animationDelay: `${ms / 2}ms` }} />
          <div style={styles.mark}>🌸</div>
        </div>

        {data?.note ? (
          <p style={{
            marginTop: 18,
            textAlign: "center",
            opacity: 0.9,
            lineHeight: 1.6,
            fontSize: 15,
            color: "var(--text)",
            fontStyle: "italic"
          }}>
            "{data.note}"
          </p>
        ) : mounted ? (
          <p style={{
            marginTop: shouldAuto ? 10 : 18,
            textAlign: "center",
            opacity: 0.5,
            fontSize: shouldAuto ? 12 : 14,
            fontStyle: "italic",
            color: "var(--text-subtle)"
          }}>
            {shouldAuto ? t("room.breath") : t("room.silence")}
          </p>
        ) : null}

        {data?.url && (
          <div style={styles.urlRow}>
            <span style={styles.urlLabel}>{t("room.link.label")}</span>
            <a href={data.url} style={styles.urlLink}>
              {data.url}
            </a>
          </div>
        )}

        {status === "ready" && !auto && data?.url && (
          <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
            <button
              style={{
                ...styles.btn,
                animation: `fadeIn 700ms ${ms}ms forwards`,
                opacity: 0,
                cursor: status !== "ready" ? "not-allowed" : "pointer"
              }}
              disabled={status !== "ready"}
              onClick={commitAndGo}
              onMouseEnter={(e) => {
                if (e.currentTarget.disabled) return;
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.background = "color-mix(in oklab, var(--accent) 10%, transparent)";
              }}
              onMouseLeave={(e) => {
                if (e.currentTarget.disabled) return;
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {t("room.open")}
            </button>
          </div>
        )}

        {status === "ready" && !data?.url && (
          <div style={{ marginTop: 22, display: "grid", gap: 10, justifyItems: "center" }}>
            <button style={styles.btnGhost} onClick={burnNow}>
              {t("room.burn.cta")}
            </button>
            <button style={styles.btn} onClick={replyNow}>
              {t("room.reply.cta")}
            </button>
            <p style={styles.replyHint}>{t("room.reply.hint")}</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes ringBreathe {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.8;
          }
          70% {
            transform: translate(-50%, -50%) scale(2.6);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }
        @keyframes markPulse {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.15); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "var(--bg)",
    color: "var(--text)",
    fontFamily: "inherit"
  },
  card: {
    width: 420,
    padding: 32,
    borderRadius: 16,
    border: "1px solid var(--border)",
    background: "var(--bg-overlay)",
    boxShadow: "var(--shadow-card)"
  },
  breathCore: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 16,
    height: 16,
    borderRadius: "50%",
    backgroundColor: "var(--accent)",
    transform: "translate(-50%, -50%)",
    boxShadow: "0 0 12px var(--accent)",
  },
  breathRing: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: "2px solid var(--accent)",
    transform: "translate(-50%, -50%) scale(1)",
    pointerEvents: "none",
    opacity: 0,
    animationName: "ringBreathe",
    animationTimingFunction: "ease-out",
    animationIterationCount: "infinite",
  },
  mark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    fontSize: 32,
    transform: "translate(-50%, -50%)",
    animation: "markPulse 3600ms ease-in-out infinite",
    filter: "drop-shadow(0 0 8px currentColor)",
  },
  btn: {
    padding: "12px 18px",
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text)",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 15,
    transition: "border-color var(--duration-snug) var(--ease-soft), background var(--duration-snug) var(--ease-soft)"
  },
  btnGhost: {
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px dashed var(--border)",
    background: "transparent",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 13
  },
  replyHint: {
    marginTop: -2,
    fontSize: 11,
    color: "var(--text-subtle)",
    opacity: 0.7,
    textAlign: "center"
  },
  urlRow: {
    marginTop: 18,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 12,
    textAlign: "center"
  },
  urlLabel: {
    color: "var(--text-subtle)",
    opacity: 0.7,
    fontSize: 11
  },
  urlLink: {
    color: "var(--text-muted)",
    textDecoration: "none",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 12,
    wordBreak: "break-all"
  },
  shellLink: {
    display: "inline-block",
    marginTop: 16,
    fontFamily: "inherit",
    color: "var(--text-muted)",
    opacity: 0.85,
    textDecoration: "none",
    fontSize: 14
  }
};
