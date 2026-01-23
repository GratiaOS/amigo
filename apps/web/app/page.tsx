"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { useTranslation } from "./i18n/useTranslation";
import { LangSwitch } from "./i18n/LangSwitch";

type DispatchResponse = { short: string; original?: string | null; note?: string | null };

// TODO: Extend Musical Notes Code for 🎵 signet (align with the 13-month energy calendar).
const SIGNETS = ["💖", "👍", "🎵", "🚬", "🐺", "🐸", "🌸", "🦅", "🐻", "🛰️", "⚓", "🫧"];
const SIGNET_HINT_KEYS: Record<string, string> = {
  "💖": "home.signet.desc.gratia",
  "👍": "home.signet.desc.yes",
  "🎵": "home.signet.desc.song",
  "🚬": "home.signet.desc.ground",
  "🐺": "home.signet.desc.pack",
  "🐸": "home.signet.desc.signal",
  "🌸": "home.signet.desc.petal",
  "🦅": "home.signet.desc.vision",
  "🐻": "home.signet.desc.strength",
  "🛰️": "home.signet.desc.channel",
  "⚓": "home.signet.desc.anchor",
  "🫧": "home.signet.desc.bubbles",
};

function firstGrapheme(input: string): string {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    const it = seg.segment(input)[Symbol.iterator]();
    const first = it.next().value;
    return first?.segment ?? "";
  }
  return Array.from(input)[0] ?? "";
}

export default function Home() {
  const { t, lang } = useTranslation();
  const base = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000").replace(
    /\/$/,
    ""
  );

  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [ttl, setTtl] = useState("7d");
  const [emoji, setEmoji] = useState("");
  const [hoveredSignet, setHoveredSignet] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DispatchResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [ogReady, setOgReady] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [canShare, setCanShare] = useState(false);

  const urlValue = url.trim();
  const noteValue = note.trim();
  const replyValue = replyTo?.trim() ?? "";
  const emojiValue = firstGrapheme(emoji.trim());
  const activeSignet = hoveredSignet || emojiValue;
  const displaySignet = activeSignet || "💖";
  const signetHintKey =
    (activeSignet && SIGNET_HINT_KEYS[activeSignet]) || "home.signet.hint";
  const isPetal = urlValue.length === 0;
  const canSubmit = urlValue.length > 0 || noteValue.length > 0;

  const payload = useMemo(
    () => ({
      note: noteValue || null,
      url: isPetal ? null : urlValue,
      ttl: ttl.trim() || null,
      max_views: isPetal ? 1 : null,
      reply_to: replyValue || null,
      emoji: emojiValue || null,
    }),
    [emojiValue, isPetal, noteValue, replyValue, ttl, urlValue]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("reply_to");
    if (v) {
      setReplyTo(v);
    }
  }, []);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setResult(null);
    setCopied(false);

    try {
      const res = await fetch(`${base}/api/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("dispatch failed");
      const data = (await res.json()) as DispatchResponse;
      setResult(data);
      // Don't reset form - let user tweak and regenerate
    } catch (err) {
      console.error("Dispatch error:", err);
      alert("Nu s-a putut genera linkul. Verifică API-ul.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, errorLabel = "Copy failed:") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (err) {
      console.error(errorLabel, err);
      return false;
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await copyToClipboard(result.short);
  };

  const bashOneLiner = result
    ? `curl -sS "${result.short}${result.original ? "?auto=1" : ""}"`
    : "";
  const ogUrl = result
    ? `/api/og/${lang}/${encodeURIComponent(emojiValue || "💖")}`
    : "";

  useEffect(() => {
    if (!result) {
      setOgReady(false);
      return;
    }

    let active = true;
    setOgReady(false);

    const warm = async () => {
      if (!ogUrl) {
        if (active) setOgReady(true);
        return;
      }
      try {
        const res = await fetch(ogUrl, { cache: "no-store" });
        if (!res.ok) throw new Error("og");
      } catch {
        // Even if prewarm fails, allow share after a short attempt.
      } finally {
        if (active) setOgReady(true);
      }
    };

    warm();
    return () => {
      active = false;
    };
  }, [result?.short, ogUrl]);

  const handleShare = async () => {
    if (!result || !ogReady) return;
    const shareUrl = result.short;
    try {
      setShareBusy(true);
      if (navigator.share) {
        await navigator.share({
          title: t("home.title"),
          text: t("home.share.text"),
          url: shareUrl,
        });
        return;
      }
    } catch (err) {
      const name = typeof err === "object" && err ? (err as { name?: string }).name : "";
      if (name === "AbortError") {
        return;
      }
    } finally {
      setShareBusy(false);
    }

    await copyToClipboard(shareUrl, "Share fallback failed:");
  };

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.telemetry}>
          <span style={styles.telemetryLabel}>UNIT: CREATION_01</span>
          <span style={styles.telemetryStatus}>
            STATUS: {loading ? "TRANSMITTING" : "IDLE"}
          </span>
          <span style={styles.telemetryLed} aria-hidden />
          <span style={styles.telemetrySignet} aria-hidden>
            {displaySignet}
          </span>
        </div>

        <div style={styles.woodPlate}>
          <div style={styles.device}>
            <span style={{ ...styles.deviceScrew, left: 14 }} aria-hidden />
            <span style={{ ...styles.deviceScrew, right: 14 }} aria-hidden />

            <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t("home.message")}</label>
              <div style={styles.textareaWrap}>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t("home.message.primary")}
                  style={styles.textarea}
                  disabled={loading}
                  rows={6}
                />
                <div style={styles.signetOverlay} aria-hidden>
                  {displaySignet}
                </div>
              </div>
              <p style={styles.hint}>{t("home.message.hint")}</p>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t("home.signet.label")}</label>
              <div style={styles.signetRow}>
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(firstGrapheme(e.target.value))}
                  placeholder={t("home.signet.placeholder")}
                  style={styles.signetInput}
                  disabled={loading}
                />
                <div style={styles.signetChoices}>
                  {SIGNETS.map((signet) => (
                    <button
                      key={signet}
                      type="button"
                      onClick={() => setEmoji(signet)}
                      onMouseEnter={() => setHoveredSignet(signet)}
                      onMouseLeave={() => setHoveredSignet(null)}
                      onFocus={() => setHoveredSignet(signet)}
                      onBlur={() => setHoveredSignet(null)}
                      style={{
                        ...styles.signetBtn,
                        opacity: emojiValue === signet ? 1 : 0.6,
                      }}
                    >
                      {signet}
                    </button>
                  ))}
                </div>
              </div>
              <p style={styles.signetHint}>{t(signetHintKey)}</p>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t("home.url.optional")}</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                style={styles.input}
                disabled={loading}
              />
            </div>

            <p style={styles.modeHint}>
              {isPetal ? t("home.hint.petal") : t("home.hint.link")}
            </p>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t("home.ttl")}</label>
              <input
                type="text"
                value={ttl}
                onChange={(e) => setTtl(e.target.value)}
                placeholder="7d"
                style={styles.input}
                disabled={loading}
              />
              <p style={styles.hint}>{t("home.ttl.hint")}</p>
            </div>

              <button
                type="submit"
                disabled={loading || !canSubmit}
                style={{
                  ...styles.btn,
                  ...(canSubmit && !loading ? styles.btnReady : null),
                  opacity: loading || !canSubmit ? 0.5 : 1,
                  cursor: loading || !canSubmit ? "not-allowed" : "pointer",
                }}
              >
                {loading
                  ? t("home.generating")
                  : isPetal
                  ? t("home.generate.petal")
                  : t("home.generate.link")}
              </button>

              <div style={styles.langWrap}>
                <LangSwitch />
              </div>
            </form>
          </div>
        </div>

        {result && (
          <div style={styles.result}>
          <div style={styles.resultHeader}>
            <span style={styles.resultLabel}>{t("home.result.label")}</span>
            <div style={styles.resultActions}>
              {canShare ? (
                <button
                  onClick={handleShare}
                  style={{
                    ...styles.shareBtn,
                    opacity: !ogReady || shareBusy ? 0.5 : 1,
                    cursor: !ogReady || shareBusy ? "not-allowed" : "pointer",
                  }}
                  disabled={!ogReady || shareBusy}
                >
                  {shareBusy
                    ? t("home.sharing")
                    : ogReady
                    ? t("home.share")
                    : t("home.previewing")}
                </button>
              ) : null}
                <button
                  onClick={handleCopy}
                  style={styles.copyBtn}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border = "1px solid var(--accent)";
                    e.currentTarget.style.color = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = "1px solid var(--border)";
                    e.currentTarget.style.color = "var(--text-muted)";
                  }}
                >
                {copied ? t("home.copied") : t("home.copy")}
              </button>
            </div>
          </div>
            <div style={styles.linkBox}>
              <code style={styles.linkText}>{result.short}</code>
            </div>

            {bashOneLiner && (
              <div style={styles.cliSection}>
                <p style={styles.cliLabel}>{t("home.result.cli")}</p>
                <pre style={styles.cliCode}>{bashOneLiner}</pre>
              </div>
            )}
          </div>
        )}

        <div style={styles.footer}>
          <a
            href="https://github.com/GratiaOS/amigo"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.footerLink}
          >
            github.com/GratiaOS/amigo
          </a>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--page-bg)",
    color: "var(--text)",
    fontFamily: "inherit",
    padding: "var(--page-padding)",
  },
  container: {
    width: "100%",
    maxWidth: 560,
  },
  telemetry: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    color: "var(--text-muted)",
    marginBottom: 14,
    padding: "0 4px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  telemetryLabel: {
    opacity: 0.8,
  },
  telemetryStatus: {
    opacity: 0.9,
  },
  telemetryLed: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: "var(--signal)",
    boxShadow: "0 0 6px var(--signal-glow), 0 0 16px var(--signal-glow)",
    animation: "ledBreath 3.8s ease-in-out infinite",
  },
  telemetrySignet: {
    fontSize: 18,
    lineHeight: 1,
    opacity: 0.8,
  },
  woodPlate: {
    padding: "var(--plate-padding)",
    borderRadius: "var(--plate-radius)",
    background: "var(--plate-bg)",
    boxShadow: "var(--plate-shadow)",
  },
  device: {
    position: "relative",
    background: "var(--device-bg)",
    border: "var(--device-border)",
    borderRadius: "var(--device-radius)",
    padding: "28px 24px 26px",
    boxShadow: "var(--device-shadow)",
  },
  deviceScrew: {
    position: "absolute",
    top: 12,
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.4)",
    opacity: "var(--device-screw-opacity)",
  },
  form: {
    position: "relative",
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    display: "block",
    fontSize: 12,
    marginBottom: 6,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.14em",
  },
  input: {
    width: "100%",
    fontSize: "var(--input-font-size)",
    background: "var(--glass-bg)",
    border: "2px solid var(--glass-border)",
    borderRadius: 12,
    color: "var(--ink-olive)",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    outline: "none",
    transition: "border-color var(--duration-snug) var(--ease-soft)",
    padding: "12px 14px",
  },
  textareaWrap: {
    position: "relative",
  },
  textarea: {
    width: "100%",
    fontSize: "var(--input-font-size)",
    background: "var(--glass-bg)",
    border: "2px solid var(--glass-border)",
    borderRadius: 12,
    color: "var(--ink-olive)",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    outline: "none",
    transition: "border-color var(--duration-snug) var(--ease-soft)",
    resize: "none",
    padding: "16px",
    minHeight: 180,
  },
  signetOverlay: {
    position: "absolute",
    right: 16,
    bottom: 12,
    fontSize: 24,
    opacity: 0.4,
    filter: "grayscale(1)",
  },
  signetRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  signetInput: {
    width: 56,
    height: 42,
    fontSize: 18,
    background: "var(--glass-bg)",
    border: "2px solid var(--glass-border)",
    borderRadius: 12,
    color: "var(--text)",
    fontFamily:
      "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Twemoji Mozilla, var(--font)",
    outline: "none",
    textAlign: "center",
    padding: "var(--input-padding)",
  },
  signetChoices: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  signetBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: "2px solid var(--glass-border)",
    background: "var(--glass-bg)",
    cursor: "pointer",
    fontSize: 16,
    fontFamily:
      "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Twemoji Mozilla, var(--font)",
    transition: "opacity var(--duration-snug) var(--ease-soft)",
  },
  signetHint: {
    fontSize: 11,
    color: "var(--text-subtle)",
    marginTop: 6,
    opacity: 0.7,
  },
  modeHint: {
    fontSize: 12,
    color: "var(--text-subtle)",
    marginTop: -6,
    marginBottom: 16,
    opacity: 0.7,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
    color: "var(--text-subtle)",
    opacity: 0.7,
  },
  btn: {
    width: "100%",
    padding: "16px 18px",
    fontSize: 16,
    background: "var(--accent)",
    color: "var(--text)",
    border: "2px solid #2f3a1b",
    borderRadius: 12,
    cursor: "pointer",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    transition: "opacity var(--duration-snug) var(--ease-soft)",
    marginTop: 10,
    boxShadow: "4px 4px 0 #1a1a18",
  },
  btnReady: {
    borderColor: "color-mix(in oklab, var(--signal) 55%, #2f3a1b)",
    boxShadow: "4px 4px 0 #1a1a18, 0 0 0 1px color-mix(in oklab, var(--signal) 35%, transparent)",
  },
  langWrap: {
    marginTop: 16,
    paddingTop: 12,
    borderTop: "1px solid color-mix(in oklab, var(--border) 55%, transparent)",
    display: "flex",
    justifyContent: "center",
    opacity: 0.8,
  },
  result: {
    marginTop: 24,
    background: "#0f110c",
    border: "2px solid #3d4035",
    borderRadius: 12,
    padding: 20,
    boxShadow: "12px 12px 0 rgba(0,0,0,0.3)",
  },
  resultHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  resultActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  resultLabel: {
    fontSize: 13,
    color: "var(--text-muted)",
    fontWeight: 500,
  },
  shareBtn: {
    padding: "6px 12px",
    fontSize: 13,
    background: "color-mix(in oklab, var(--signal) 12%, transparent)",
    border: "1px solid color-mix(in oklab, var(--signal) 55%, var(--border))",
    borderRadius: 6,
    color: "var(--text)",
    fontFamily: "inherit",
    transition: "border-color var(--duration-snug) var(--ease-soft), color var(--duration-snug) var(--ease-soft)",
  },
  copyBtn: {
    padding: "6px 12px",
    fontSize: 13,
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: 6,
    color: "var(--text-muted)",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "border-color var(--duration-snug) var(--ease-soft), color var(--duration-snug) var(--ease-soft)",
  },
  linkBox: {
    background: "rgba(0,0,0,0.25)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: 12,
    overflowX: "auto",
  },
  linkText: {
    fontSize: 14,
    color: "var(--accent)",
    fontFamily: "inherit",
    wordBreak: "break-all",
  },
  cliSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid var(--border)",
  },
  cliLabel: {
    fontSize: 12,
    color: "var(--text-subtle)",
    marginBottom: 8,
    fontWeight: 500,
  },
  cliCode: {
    background: "rgba(0,0,0,0.25)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    padding: 10,
    fontSize: 13,
    color: "var(--text-muted)",
    fontFamily: "inherit",
    overflowX: "auto",
    margin: 0,
  },
  footer: {
    marginTop: 32,
    textAlign: "center",
  },
  footerLink: {
    fontSize: 13,
    color: "var(--text-muted)",
    textDecoration: "none",
    opacity: 0.7,
    transition: "opacity var(--duration-snug) var(--ease-soft)",
  },
};
