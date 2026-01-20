'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { LangSwitch } from '../../i18n/LangSwitch';

const SCRAMBLE_CHARS = '█▓▒░<>--=+~'.split('');
const SCRAMBLE_FRAMES = 16;
const SCRAMBLE_INTERVAL_MS = 50;
const KEEP_ORIGINAL_PROBABILITY = 0.45;

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
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    const it = seg.segment(input)[Symbol.iterator]();
    const first = it.next().value;
    return first?.segment ?? null;
  }
  return Array.from(input)[0] ?? null;
}

export default function RoomClient({ params }: Props) {
  const { t, lang } = useTranslation();
  const base = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000').replace(/\/$/, '');
  const [data, setData] = useState<Resolve | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'gone' | 'burned'>('loading');
  const [auto, setAuto] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'sealed' | 'tuning' | 'open'>('sealed');
  const [displayContent, setDisplayContent] = useState('');

  const ms = 3600; // Breathing cycle (mai somatic)
  const redirectTo = data?.url ?? null;

  // Detect auto mode after mount (avoids hydration mismatch)
  useEffect(() => {
    setMounted(true);
    const v = new URLSearchParams(window.location.search).get('auto');
    setAuto(v === '1' || v === 'true');
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`${base}/api/resolve/${params.slug}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('not-found');
        return (await r.json()) as Resolve;
      })
      .then((json) => {
        if (!active) return;
        setData(json);
        setStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setStatus('gone');
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
        method: 'POST',
        keepalive: true, // Critical: Request survives page navigation
      });
      if (!res.ok && !data.url) {
        setStatus('gone');
        return;
      }
    } catch (e) {
      console.error('Ghost walk:', e);
      if (!data.url) {
        setStatus('gone');
        return;
      }
      window.location.href = data.url;
      return;
    }

    if (!data.url) {
      setStatus('burned');
      return;
    }

    // Journey begins
    window.location.href = data.url;
  };

  const burnNow = async () => {
    if (!data) return;
    try {
      const res = await fetch(`${base}/api/commence/${params.slug}`, {
        method: 'POST',
        keepalive: true,
      });
      if (!res.ok) {
        setStatus('gone');
        return;
      }
    } catch (e) {
      console.error('Burn failed:', e);
      setStatus('gone');
      return;
    }
    setStatus('burned');
  };

  const copyLink = async () => {
    const link = data?.url;
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const el = document.createElement('textarea');
      el.value = link;
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.focus();
      el.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(el);
      }
    }
  };

  const replyNow = async () => {
    if (!data) return;
    try {
      const res = await fetch(`${base}/api/commence/${params.slug}`, {
        method: 'POST',
        keepalive: true,
      });
      if (!res.ok) {
        setStatus('gone');
        return;
      }
    } catch (e) {
      console.error('Reply burn failed:', e);
      setStatus('gone');
      return;
    }

    const qs = new URLSearchParams();
    qs.set('reply_to', params.slug);
    if (lang) {
      qs.set('lang', lang);
    }
    window.location.href = `/?${qs.toString()}`;
  };

  const shouldAuto = auto;

  const openSeal = () => {
    if (view !== 'sealed') return;
    setView('tuning');
  };

  // Auto-open after breath cycle (ritual mode) if ?auto=1
  useEffect(() => {
    if (!shouldAuto || status !== 'ready' || !data) return;
    if (view === 'sealed') {
      setView('tuning');
    }
  }, [shouldAuto, status, data, view]);

  useEffect(() => {
    if (!shouldAuto || status !== 'ready' || !data || view !== 'open') return;
    const timer = setTimeout(() => {
      commitAndGo();
    }, ms);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAuto, status, redirectTo, ms, view]);

  useEffect(() => {
    if (view !== 'tuning' || !data) return;
    const source =
      data.note?.trim() ||
      (data.url ? t('room.open') : shouldAuto ? t('room.breath') : t('room.silence'));
    let frame = 0;
    const interval = setInterval(() => {
      const scrambled = source
        .split('')
        .map((ch) =>
          Math.random() > KEEP_ORIGINAL_PROBABILITY
            ? SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
            : ch
        )
        .join('');
      setDisplayContent(scrambled);
      frame += 1;
      if (frame >= SCRAMBLE_FRAMES) {
        clearInterval(interval);
        setDisplayContent(source);
        setView('open');
      }
    }, SCRAMBLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [view, data, data?.url, t, shouldAuto]);

  if (status === 'gone') {
    return (
      <main style={styles.main}>
        <div style={{ ...styles.card, position: 'relative' }}>
          <LangSwitch />

          <p style={{ opacity: 0.85, marginBottom: 14, fontSize: 16, textAlign: 'center' }}>{t('room.gone.title')}</p>
          <p style={{ opacity: 0.65, lineHeight: 1.6, fontSize: 14, textAlign: 'center', color: 'var(--text-muted)' }}>{t('room.gone.body1')}</p>
          <p style={{ opacity: 0.65, lineHeight: 1.6, fontSize: 14, marginTop: 10, textAlign: 'center', color: 'var(--text-muted)' }}>
            {t('room.gone.body2')}
          </p>
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <a href="/" style={styles.shellLink}>
              {t('room.gone.cta')}
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (status === 'burned') {
    return (
      <main style={styles.main}>
        <div style={{ ...styles.card, position: 'relative' }}>
          <LangSwitch />

          <p style={{ opacity: 0.85, marginBottom: 14, fontSize: 16, textAlign: 'center' }}>{t('room.burned.title')}</p>
          <p style={{ opacity: 0.65, lineHeight: 1.6, fontSize: 14, textAlign: 'center', color: 'var(--text-muted)' }}>{t('room.burned.body1')}</p>
          <p style={{ opacity: 0.65, lineHeight: 1.6, fontSize: 14, marginTop: 10, textAlign: 'center', color: 'var(--text-muted)' }}>
            {t('room.burned.body2')}
          </p>
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <a href="/" style={styles.shellLink}>
              {t('room.burned.cta')}
            </a>
          </div>
        </div>
      </main>
    );
  }

  const defaultSignet = '💖';
  const signet = firstGrapheme(data?.emoji) || defaultSignet;
  const markSignet = signet;
  const showOgPreview = process.env.NODE_ENV !== 'production';
  const ogPreviewUrl = `/api/og/${lang}/${encodeURIComponent(signet)}`;

  // VARIANTA 2: Personalizat (decomentează linia de jos ca să activezi)
  // const senderText = t("room.sender.bear");

  return (
    <main style={styles.main}>
      <div style={{ ...styles.card, position: 'relative' }}>
        <LangSwitch />

        {/* Diagnostics (low priority) */}
        <p style={styles.senderCaption}>
          <span style={styles.diagMono}>CH:</span> <span style={styles.diagValue}>{params.slug.slice(0, 4).toUpperCase()}</span>
          <span style={styles.diagSep}>•</span>
          <span style={styles.diagMono}>NET:</span> <span style={styles.diagValue}>SECURE</span>
          <span style={styles.diagSep}>•</span>
          <span style={styles.diagMono}>SIG:</span> <span style={styles.diagValue}>{markSignet}</span>
        </p>

        {/* Message bubble (primary) */}
        <div style={styles.msgBubble}>
          <div style={styles.msgHeader}>
            <span style={styles.msgSignet} aria-hidden>
              {markSignet}
            </span>
            <span style={styles.msgHeaderText}>{t('home.title')}</span>
            <div style={{ flex: 1 }} />
            <div style={styles.msgRingWrap} aria-hidden>
              <div style={styles.breathCoreSmall} />
              <div style={{ ...styles.breathRingSmall, animationDuration: `${ms}ms` }} />
              <div style={{ ...styles.breathRingSmall, animationDuration: `${ms}ms`, animationDelay: `${ms / 2}ms` }} />
            </div>
          </div>

          {view === 'sealed' ? (
            <div style={styles.sealWrap}>
              <div style={styles.sealSignet} aria-hidden>
                {markSignet}
              </div>
              <p style={styles.sealTitle}>{t('room.seal.title')}</p>
              <p style={styles.sealSubtitle}>{t('room.seal.subtitle')}</p>
            </div>
          ) : view === 'tuning' ? (
            <p style={styles.msgText}>{displayContent}</p>
          ) : data?.note ? (
            <p style={styles.msgText}>“{data.note}”</p>
          ) : mounted ? (
            <p style={styles.msgTextMuted}>{shouldAuto ? t('room.breath') : t('room.silence')}</p>
          ) : null}

          {status === 'ready' && (
            <>
              <div style={styles.msgDivider} aria-hidden />
              <div style={styles.msgFooter}>
                <div style={styles.wtBeep} aria-hidden>
                  <span style={styles.wtBeepIcon}>📻</span>
                  <span style={styles.wtBeepDot} />
                  <span style={styles.wtBeepBar} />
                  <span style={{ ...styles.wtBeepBar, animationDelay: '120ms' }} />
                  <span style={{ ...styles.wtBeepBar, animationDelay: '240ms' }} />
                </div>

                {view === 'sealed' ? (
                  <button style={styles.pttBtn} onClick={openSeal} aria-label={t('room.seal.cta')} data-wt="1">
                    <span style={styles.pttIcon} aria-hidden>
                      ✴️
                    </span>
                    <span style={styles.pttLabel}>{t('room.seal.cta')}</span>
                  </button>
                ) : data?.url ? (
                  <button style={styles.pttBtn} onClick={commitAndGo} aria-label={t('room.open')} data-wt="1">
                    <span style={styles.pttIcon} aria-hidden>
                      ⭕
                    </span>
                    <span style={styles.pttLabel}>{t('room.open')}</span>
                  </button>
                ) : (
                  <button style={styles.pttBtn} onClick={replyNow} aria-label={t('room.reply.cta')} data-wt="1">
                    <span style={styles.pttIcon} aria-hidden>
                      🎙️
                    </span>
                    <span style={styles.pttLabel}>{t('room.reply.cta')}</span>
                  </button>
                )}

                {view === 'sealed' ? null : (
                  <>
                    <div style={styles.miniRow}>
                      {data?.url ? (
                        <button style={styles.miniBtn} onClick={copyLink} aria-label={t('room.link.label')} data-wt="1">
                          <span style={styles.wtIcon} aria-hidden>
                            🔗
                          </span>
                          <span>{t('home.copy')}</span>
                        </button>
                      ) : null}

                      <button style={styles.miniBtnDanger} onClick={burnNow} aria-label={t('room.burn.cta')} data-wt="1">
                        <span style={styles.wtIcon} aria-hidden>
                          🔥
                        </span>
                        <span>{t('room.burn.cta')}</span>
                      </button>
                    </div>

                    {!data?.url ? <p style={styles.replyHint}>{t('room.reply.hint')}</p> : null}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {view === 'open' && data?.url && (
          <div style={styles.urlRow}>
            <span style={styles.urlLabel}>{t('room.link.label')}</span>
            <a href={data.url} style={styles.urlLink}>
              {data.url}
            </a>
          </div>
        )}

        {showOgPreview && (
          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <a href={ogPreviewUrl} style={styles.ogLink} target="_blank" rel="noreferrer">
              OG preview
            </a>
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
        button[data-wt=1]:hover {
          border-color: var(--accent);
          background: color-mix(in oklab, var(--accent) 16%, transparent);
          transform: translateY(-1px);
        }
        button[data-wt=1]:active {
          transform: translateY(0px) scale(0.99);
          background: color-mix(in oklab, var(--accent) 22%, transparent);
          box-shadow: 0 10px 18px rgba(0,0,0,0.16), inset 0 2px 10px rgba(0,0,0,0.28);
        }
        @keyframes wtBeep {
          0% { transform: scaleY(0.35); opacity: 0.45; }
          40% { transform: scaleY(1); opacity: 0.9; }
          100% { transform: scaleY(0.35); opacity: 0.45; }
        }
        @keyframes wtDot {
          0% { transform: scale(0.85); opacity: 0.55; }
          50% { transform: scale(1.05); opacity: 0.95; }
          100% { transform: scale(0.85); opacity: 0.55; }
        }
      `}</style>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  main: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--page-bg)',
    color: 'var(--text)',
    fontFamily: 'inherit',
    padding: 'var(--page-padding)',
    overflowX: 'hidden',
  },
  card: {
    width: 'min(420px, 100%)',
    padding: 'var(--card-padding)',
    borderRadius: 'var(--card-radius)',
    border: 'var(--card-border)',
    background: 'var(--card-bg)',
    boxShadow: 'var(--card-shadow)',
  },
  breathCore: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 0 12px var(--accent)',
  },
  breathRing: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '2px solid var(--accent)',
    transform: 'translate(-50%, -50%) scale(1)',
    pointerEvents: 'none',
    opacity: 0,
    animationName: 'ringBreathe',
    animationTimingFunction: 'ease-out',
    animationIterationCount: 'infinite',
  },
  mark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    fontSize: 32,
    transform: 'translate(-50%, -50%)',
    fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Twemoji Mozilla, var(--font)',
    animation: 'markPulse 3600ms ease-in-out infinite',
    filter: 'drop-shadow(0 0 8px currentColor)',
  },
  btn: {
    padding: '12px 18px',
    borderRadius: 12,
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 15,
    transition: 'border-color var(--duration-snug) var(--ease-soft), background var(--duration-snug) var(--ease-soft)',
  },
  btnGhost: {
    padding: '10px 16px',
    borderRadius: 12,
    border: '1px dashed var(--border)',
    background: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 13,
  },
  wtIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    lineHeight: 1,
    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.22))',
  },
  wtBeep: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '0 4px',
    opacity: 0.92,
    justifySelf: 'center',
    flex: '0 0 auto',
  },
  wtBeepIcon: {
    fontSize: 14,
    lineHeight: 1,
    opacity: 0.85,
    filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.28))',
  },
  wtBeepDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    background: 'color-mix(in oklab, var(--accent) 70%, white)',
    boxShadow: '0 0 0 3px rgba(255,255,255,0.45), 0 10px 22px rgba(0,0,0,0.22)',
    animation: 'wtDot 900ms ease-in-out infinite',
  },
  wtBeepBar: {
    width: 4,
    height: 14,
    borderRadius: 99,
    background: 'color-mix(in oklab, var(--accent) 55%, white)',
    transformOrigin: 'bottom',
    animation: 'wtBeep 720ms ease-in-out infinite',
    boxShadow: '0 10px 18px rgba(0,0,0,0.18)',
  },
  msgDivider: {
    marginTop: 14,
    height: 1,
    width: '100%',
    background: 'color-mix(in oklab, var(--border) 65%, transparent)',
    opacity: 0.8,
  },
  msgFooter: {
    marginTop: 12,
    display: 'grid',
    gap: 12,
    justifyItems: 'stretch',
    width: '100%',
  },
  pttBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    padding: '16px 18px',
    borderRadius: 22,
    border: '2px solid color-mix(in oklab, var(--accent) 55%, var(--border))',
    background: 'color-mix(in oklab, var(--accent) 10%, rgba(0,0,0,0.18))',
    color: 'var(--text)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 15,
    fontWeight: 750,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    boxShadow: '0 14px 28px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
    transition:
      'border-color var(--duration-snug) var(--ease-soft), background var(--duration-snug) var(--ease-soft), transform var(--duration-snug) var(--ease-soft)',
  },
  pttIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: 999,
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.22)',
    boxShadow: '0 10px 22px rgba(0,0,0,0.18)',
    fontSize: 16,
  },
  pttLabel: {
    lineHeight: 1,
  },
  miniRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexWrap: 'nowrap',
  },
  miniBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '10px 12px',
    borderRadius: 14,
    border: '1px solid color-mix(in oklab, var(--border) 75%, transparent)',
    background: 'color-mix(in oklab, var(--card-bg) 62%, transparent)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: 12,
    fontWeight: 650,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    flex: '1 1 0',
    minWidth: 0,
    boxShadow: '0 10px 20px rgba(0,0,0,0.14)',
    transition:
      'border-color var(--duration-snug) var(--ease-soft), background var(--duration-snug) var(--ease-soft), transform var(--duration-snug) var(--ease-soft)',
  },
  miniBtnDanger: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '10px 12px',
    borderRadius: 14,
    border: '1px solid color-mix(in oklab, #ff6b6b 35%, var(--border))',
    background: 'color-mix(in oklab, #ff6b6b 10%, rgba(0,0,0,0.18))',
    color: 'var(--text)',
    cursor: 'pointer',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: 12,
    fontWeight: 750,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    flex: '1 1 0',
    minWidth: 0,
    boxShadow: '0 10px 20px rgba(0,0,0,0.14)',
    transition:
      'border-color var(--duration-snug) var(--ease-soft), background var(--duration-snug) var(--ease-soft), transform var(--duration-snug) var(--ease-soft)',
  },
  replyHint: {
    marginTop: 0,
    fontSize: 11,
    color: 'var(--text-subtle)',
    opacity: 0.72,
    textAlign: 'center',
  },
  urlRow: {
    marginTop: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    fontSize: 12,
    textAlign: 'center',
  },
  urlLabel: {
    color: 'var(--text-subtle)',
    opacity: 0.7,
    fontSize: 11,
  },
  urlLink: {
    color: 'var(--text-muted)',
    textDecoration: 'none',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: 12,
    wordBreak: 'break-all',
  },
  shellLink: {
    display: 'inline-block',
    marginTop: 16,
    fontFamily: 'inherit',
    color: 'var(--text-muted)',
    opacity: 0.85,
    textDecoration: 'none',
    fontSize: 14,
  },
  ogLink: {
    display: 'inline-block',
    fontSize: 12,
    color: 'var(--text-subtle)',
    opacity: 0.8,
    textDecoration: 'underline',
    fontFamily: 'inherit',
  },
  senderCaption: {
    opacity: 0.72,
    marginBottom: 12,
    fontSize: 11,
    textAlign: 'center',
    color: 'var(--text-subtle)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  diagMono: {
    opacity: 0.7,
  },
  diagValue: {
    opacity: 0.92,
    color: 'var(--text-muted)',
  },
  diagSep: {
    display: 'inline-block',
    margin: '0 10px',
    opacity: 0.35,
  },
  msgBubble: {
    marginTop: 6,
    borderRadius: 18,
    border: '1px solid color-mix(in oklab, var(--border) 70%, transparent)',
    background: 'color-mix(in oklab, var(--card-bg) 70%, transparent)',
    padding: '16px 16px 18px',
    boxShadow: '0 18px 40px rgba(0,0,0,0.16)',
  },
  msgHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    opacity: 0.9,
  },
  msgSignet: {
    width: 34,
    height: 34,
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.24)',
    boxShadow: '0 10px 22px rgba(0,0,0,0.12)',
  },
  msgHeaderText: {
    fontSize: 12,
    fontWeight: 650,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  },
  msgRingWrap: {
    position: 'relative',
    width: 20,
    height: 20,
    marginLeft: 6,
    opacity: 0.85,
  },
  breathCoreSmall: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 0 10px var(--accent)',
  },
  breathRingSmall: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 6,
    height: 6,
    borderRadius: '50%',
    border: '2px solid var(--accent)',
    transform: 'translate(-50%, -50%) scale(1)',
    pointerEvents: 'none',
    opacity: 0,
    animationName: 'ringBreathe',
    animationTimingFunction: 'ease-out',
    animationIterationCount: 'infinite',
  },
  msgText: {
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.92,
    lineHeight: 1.6,
    fontSize: 18,
    color: 'var(--text)',
    fontStyle: 'italic',
    padding: '6px 6px 2px',
  },
  msgTextMuted: {
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.55,
    lineHeight: 1.6,
    fontSize: 16,
    color: 'var(--text-subtle)',
    fontStyle: 'italic',
    padding: '6px 6px 2px',
  },
  sealWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    padding: '10px 6px 6px',
  },
  sealSignet: {
    width: 84,
    height: 84,
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 38,
    background: 'rgba(0,0,0,0.22)',
    border: '2px solid color-mix(in oklab, var(--accent) 40%, var(--border))',
    boxShadow: '0 18px 34px rgba(0,0,0,0.24)',
  },
  sealTitle: {
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--text)',
    textAlign: 'center',
  },
  sealSubtitle: {
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    opacity: 0.85,
    textAlign: 'center',
  },
};
