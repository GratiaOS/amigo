"use client";

import { SUPPORTED_LANGS, type Lang } from "./i18n";
import { useTranslation } from "./useTranslation";

export function LangSwitch() {
  const { lang, setLanguage } = useTranslation();

  return (
    <>
      <div className="lang-switch-container">
        {SUPPORTED_LANGS.map((l) => (
          <button
            key={l}
            onClick={() => setLanguage(l)}
            className="lang-switch-btn"
            data-active={lang === l}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <style jsx>{`
        .lang-switch-container {
          position: static;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .lang-switch-btn {
          padding: 6px 10px;
          font-size: 12px;
          background: var(--bg-overlay);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-muted);
          cursor: pointer;
          font-family: inherit;
          opacity: 0.5;
          font-weight: 400;
          transition: opacity var(--duration-snug) var(--ease-soft);
        }

        .lang-switch-btn[data-active="true"] {
          opacity: 1;
          font-weight: 600;
        }

        .lang-switch-btn:hover {
          opacity: 1;
        }

        @media (max-width: 640px) {
          .lang-switch-btn {
            padding: 4px 8px;
            font-size: 11px;
          }
        }
      `}</style>
    </>
  );
}
