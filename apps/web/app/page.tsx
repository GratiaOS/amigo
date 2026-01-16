"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { useTranslation } from "./i18n/useTranslation";
import { LangSwitch } from "./i18n/LangSwitch";

type DispatchResponse = { short: string; original?: string | null; note?: string | null };

export default function Home() {
  const { t } = useTranslation();
  const base = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000").replace(
    /\/$/,
    ""
  );

  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [ttl, setTtl] = useState("7d");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DispatchResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const urlValue = url.trim();
  const noteValue = note.trim();
  const isPetal = urlValue.length === 0;
  const canSubmit = urlValue.length > 0 || noteValue.length > 0;

  const payload = useMemo(
    () => ({
      note: noteValue || null,
      url: isPetal ? null : urlValue,
      ttl: ttl.trim() || null,
      max_views: isPetal ? 1 : null,
    }),
    [isPetal, noteValue, ttl, urlValue]
  );

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

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.short);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const bashOneLiner = result
    ? `curl -sS "${result.short}?auto=1"`
    : "";

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>{t("home.title")}</h1>
          <p style={styles.subtitle}>{t("home.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ ...styles.form, position: "relative" }}>
          <LangSwitch />

          <div style={styles.fieldGroup}>
            <label style={styles.label}>{t("home.note.primary")}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("home.note")}
              style={styles.textarea}
              disabled={loading}
              rows={4}
            />
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
        </form>

        {result && (
          <div style={styles.result}>
            <div style={styles.resultHeader}>
              <span style={styles.resultLabel}>{t("home.result.label")}</span>
              <button
                onClick={handleCopy}
                style={styles.copyBtn}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                {copied ? t("home.copied") : t("home.copy")}
              </button>
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
    background: "var(--bg)",
    color: "var(--text)",
    fontFamily: "inherit",
    padding: 24,
  },
  container: {
    width: "100%",
    maxWidth: 520,
  },
  header: {
    textAlign: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 600,
    marginBottom: 8,
    color: "var(--text)",
  },
  subtitle: {
    fontSize: 15,
    color: "var(--text-muted)",
    opacity: 0.85,
  },
  form: {
    background: "var(--bg-overlay)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 24,
    boxShadow: "var(--shadow-card)",
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    display: "block",
    fontSize: 14,
    marginBottom: 6,
    color: "var(--text-muted)",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text)",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color var(--duration-snug) var(--ease-soft)",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text)",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color var(--duration-snug) var(--ease-soft)",
    resize: "vertical",
  },
  modeHint: {
    fontSize: 12,
    color: "var(--text-subtle)",
    marginTop: -6,
    marginBottom: 16,
    opacity: 0.7,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
    color: "var(--text-subtle)",
    opacity: 0.7,
  },
  btn: {
    width: "100%",
    padding: "12px 18px",
    fontSize: 15,
    background: "var(--accent)",
    color: "var(--accent-on)",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 500,
    transition: "opacity var(--duration-snug) var(--ease-soft)",
    marginTop: 6,
  },
  result: {
    marginTop: 24,
    background: "var(--bg-overlay)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 20,
    boxShadow: "var(--shadow-card)",
  },
  resultHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 13,
    color: "var(--text-muted)",
    fontWeight: 500,
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
    background: "var(--bg)",
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
    background: "var(--bg)",
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
