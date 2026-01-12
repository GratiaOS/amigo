"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

type Props = { params: { slug: string } };
type Resolve = { url: string; note?: string | null; expires_at?: number | null };

export default function Room({ params }: Props) {
  const base = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  const [data, setData] = useState<Resolve | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "gone">("loading");

  const ms = 3600; // Breathing cycle (mai somatic)
  const redirectTo = data?.url;

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

  // No auto-redirect. User chooses when to open.

  if (status === "gone") {
    return (
      <main style={styles.main}>
        <div style={styles.card}>
          <p style={{ opacity: 0.85, marginBottom: 14, fontSize: 16, textAlign: "center" }}>
            Urma s-a șters.
          </p>
          <p style={{ opacity: 0.65, lineHeight: 1.6, fontSize: 14, textAlign: "center", color: "var(--text-muted)" }}>
            Link-urile de aici sunt ca vorbele spuse pe jos, la soare.
          </p>
          <p style={{ opacity: 0.65, lineHeight: 1.6, fontSize: 14, marginTop: 10, textAlign: "center", color: "var(--text-muted)" }}>
            Poate îi ceri din nou.
          </p>
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <a href="/" style={styles.shellLink}>{`> fă-ți o urmă nouă_`}</a>
          </div>
        </div>
      </main>
    );
  }

  // VARIANTA 1: Generic (active acum)
  const senderText = "Un prieten ți-a trimis asta.";

  // VARIANTA 2: Personalizat (decomentează linia de jos ca să activezi)
  // const senderText = "Ursul ți-a trimis asta.";

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <p style={{ opacity: 0.8, marginBottom: 16, fontSize: 15, textAlign: "center" }}>
          {senderText}
        </p>

        <div style={{ ...styles.ring, animationDuration: `${ms}ms` }} />

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
        ) : (
          <p style={{
            marginTop: 18,
            textAlign: "center",
            opacity: 0.5,
            fontSize: 14,
            fontStyle: "italic",
            color: "var(--text-subtle)"
          }}>
            (liniște)
          </p>
        )}

        {status === "ready" && (
          <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
            <button
              style={{
                ...styles.btn,
                animation: "fadeIn 1s 2s forwards",
                opacity: 0,
              }}
              onClick={() => redirectTo && (window.location.href = redirectTo)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.background = "color-mix(in oklab, var(--accent) 10%, transparent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              Deschide
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes breathe {
          0% { transform: scale(0.98); opacity: 0.6; }
          50% { transform: scale(1.02); opacity: 0.9; }
          100% { transform: scale(0.98); opacity: 0.6; }
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
  ring: {
    width: 96,
    height: 96,
    borderRadius: 999,
    border: "2px solid var(--accent)",
    margin: "0 auto",
    animationName: "breathe",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "1"
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
