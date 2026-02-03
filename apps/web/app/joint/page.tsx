'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';
const RESONANCE = {
  yellow: { label: 'YELLOW · L3', color: '#FFD700' },
  rose: { label: 'ROSE · L4', color: '#FF66CC' },
  white: { label: 'WHITE · L7', color: '#FFFFFF' },
} as const;
type ResonanceKey = keyof typeof RESONANCE;

export default function JointLanding() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [joinId, setJoinId] = useState('');
  const [error, setError] = useState('');
  const [agree, setAgree] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [resonance, setResonance] = useState<ResonanceKey>('yellow');
  const resonanceColor = RESONANCE[resonance].color;

  const createRoom = async () => {
    if (creating) return;
    setCreating(true);
    setError('');
    try {
      const res = await fetch(`${apiBase}/api/joint`, { method: 'POST' });
      if (!res.ok) throw new Error('create_failed');
      const data = await res.json();
      if (data?.id) {
        router.push(`/joint/${data.id}`);
        return;
      }
      throw new Error('invalid_response');
    } catch {
      setError('Nu pot crea canal acum.');
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = () => {
    const trimmed = joinId.trim();
    if (!trimmed) return;
    router.push(`/joint/${trimmed}`);
  };

  return (
    <main style={styles.shell}>
      <div style={styles.radar}>
        <span style={{ ...styles.radarRing, ...radarStyle(resonanceColor), animationDelay: '0s' }} />
        <span style={{ ...styles.radarRing, ...radarStyle(resonanceColor), animationDelay: '1.2s' }} />
        <span style={{ ...styles.radarRing, ...radarStyle(resonanceColor), animationDelay: '2.4s' }} />
      </div>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.kicker}>🪽 🛤️ ✨</span>
          <span style={styles.status}>READY</span>
        </div>
        <div style={styles.resonanceRow}>
          {(Object.keys(RESONANCE) as ResonanceKey[]).map((key) => (
            <button
              key={key}
              type="button"
              style={{
                ...styles.resonanceChip,
                borderColor: key === resonance ? RESONANCE[key].color : 'rgba(255,255,255,0.18)',
                color: key === resonance ? RESONANCE[key].color : 'var(--text-muted)',
              }}
              onClick={() => setResonance(key)}
            >
              {RESONANCE[key].label}
            </button>
          ))}
        </div>

        <h1 style={styles.title}>Dosarele / Files</h1>
        <p style={styles.subtle}>RDM_Kybalion · StreetFighter ✨</p>
        <p style={styles.quote}>
          „Vreți democrație? Nicio problemă, o facem tot noi. - Ion Iliescu”
        </p>

        <p style={styles.note}>
          În 1971, după turneul asiatic și Tezele din iulie, România intră într-o fază de
          reideologizare și cult al personalității. Asta e pragul pe care îl cartografiem
          aici: sistem intern, influențe externe, mituri populare.
        </p>

        {!confirmed ? (
          <div style={styles.confirmCard}>
            <label style={styles.confirmLabel}>
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span>
                Declar că sunt de acord cu Covenantul Grădinii,{' '}
                <a
                  href="/covenant"
                  style={styles.confirmLink}
                  title="/Users/raz/Sites/m3/COVENANT.md"
                >
                  click aici dacă vrei să-l citești
                </a>
                .
              </span>
            </label>
            <button
              style={{
                ...styles.secondaryBtn,
                ...styles.confirmBtn,
                opacity: agree ? 1 : 0.5,
                cursor: agree ? 'pointer' : 'not-allowed',
              }}
              onClick={() => setConfirmed(true)}
              disabled={!agree}
            >
              CONFIRM
            </button>
          </div>
        ) : (
          <>
            <button style={styles.primaryBtn} onClick={createRoom} disabled={creating}>
              {creating ? 'Creating…' : 'Create Channel'}
            </button>

            <div style={styles.joinRow}>
              <input
                style={styles.input}
                placeholder="Join by code"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
              />
              <button style={styles.secondaryBtn} onClick={joinRoom}>
                Join
              </button>
            </div>
          </>
        )}

        <p style={styles.statusLine}>Status: Vínculo protejat 🔗</p>
        <p style={styles.offlineNote}>
          Creat să reziste. Chiar și fără net. ⚓ · Rose/White rulează local-only + auto-burn.
        </p>

        {error ? <p style={styles.error}>{error}</p> : null}
      </div>
      <style jsx global>{`
        @keyframes jointRadarPulse {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          40% {
            opacity: 0.12;
          }
          100% {
            transform: scale(3.4);
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}

function radarStyle(color: string): React.CSSProperties {
  return {
    border: `1px dashed color-mix(in oklab, ${color} 62%, transparent)`,
    boxShadow: `0 0 24px color-mix(in oklab, ${color} 28%, transparent)`,
  };
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    background:
      'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.05), transparent 45%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.03), transparent 40%), #0b0b0a',
    color: 'var(--text)',
    padding: 24,
    fontFamily: 'inherit',
    position: 'relative',
    overflow: 'hidden',
    isolation: 'isolate',
  },
  radar: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
    zIndex: 0,
  },
  radarRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: '999px',
    animation: 'jointRadarPulse 3.6s ease-out infinite',
  },
  card: {
    width: 'min(480px, 100%)',
    padding: 24,
    borderRadius: 22,
    border: '1px solid color-mix(in oklab, var(--border) 70%, transparent)',
    background: 'rgba(15,15,14,0.72)',
    backdropFilter: 'blur(14px)',
    boxShadow: '0 32px 60px rgba(0,0,0,0.35)',
    display: 'grid',
    gap: 16,
    position: 'relative',
    zIndex: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  },
  kicker: { opacity: 0.7 },
  status: { opacity: 0.9 },
  resonanceRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  resonanceChip: {
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.18)',
    background: 'rgba(0,0,0,0.2)',
    padding: '6px 10px',
    fontSize: 10,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  title: {
    margin: 0,
    fontSize: 28,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  subtle: {
    margin: 0,
    fontSize: 13,
    color: 'var(--text-muted)',
  },
  quote: {
    margin: 0,
    fontSize: 14,
    fontStyle: 'italic',
    color: 'color-mix(in oklab, var(--text) 85%, var(--text-muted))',
    lineHeight: 1.6,
  },
  note: {
    margin: 0,
    fontSize: 12,
    color: 'var(--text-muted)',
    lineHeight: 1.6,
  },
  primaryBtn: {
    padding: '14px 16px',
    borderRadius: 16,
    border: '2px solid color-mix(in oklab, var(--accent) 60%, var(--border))',
    background: 'color-mix(in oklab, var(--accent) 12%, rgba(0,0,0,0.25))',
    color: 'var(--text)',
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  joinRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 12,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    borderRadius: 12,
    border: '1px solid color-mix(in oklab, var(--border) 70%, transparent)',
    background: 'rgba(0,0,0,0.2)',
    color: 'var(--text)',
    padding: '12px 14px',
    fontSize: 14,
    outline: 'none',
  },
  secondaryBtn: {
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid color-mix(in oklab, var(--border) 70%, transparent)',
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--text)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    cursor: 'pointer',
  },
  confirmCard: {
    display: 'grid',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    border: '1px solid color-mix(in oklab, var(--border) 70%, transparent)',
    background: 'rgba(0,0,0,0.25)',
  },
  confirmLabel: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    fontSize: 12,
    color: 'var(--text-muted)',
    lineHeight: 1.5,
  },
  confirmLink: {
    color: 'var(--text)',
    textDecoration: 'underline',
  },
  confirmBtn: {
    justifySelf: 'start',
    minHeight: 44,
    minWidth: 140,
    fontWeight: 700,
  },
  statusLine: {
    margin: 0,
    fontSize: 12,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  },
  offlineNote: {
    margin: 0,
    fontSize: 12,
    color: 'var(--text-muted)',
    opacity: 0.7,
  },
  error: {
    margin: 0,
    color: 'var(--text-muted)',
    fontSize: 12,
  },
};
