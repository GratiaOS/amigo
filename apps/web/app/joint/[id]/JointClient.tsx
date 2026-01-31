'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type JointEvent =
  | { type: 'chat'; name: string; text: string; ts: number }
  | { type: 'system'; text: string; ts: number }
  | { type: 'burn'; ts: number };

type JointClientEvent = { type: 'chat'; text: string } | { type: 'ping' };

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

function toWsUrl(base: string) {
  if (base.startsWith('https://')) return base.replace('https://', 'wss://');
  if (base.startsWith('http://')) return base.replace('http://', 'ws://');
  return base;
}

export default function JointClient({ id }: { id: string }) {
  const [status, setStatus] = useState<'connecting' | 'ready' | 'burned' | 'closed'>('connecting');
  const [messages, setMessages] = useState<JointEvent[]>([]);
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  const [roomUrl, setRoomUrl] = useState('');
  const wsUrl = useMemo(() => {
    const base = toWsUrl(apiBase);
    const n = encodeURIComponent(name || 'Guest');
    return `${base}/api/joint/ws/${id}?name=${n}`;
  }, [id, name]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRoomUrl(`${window.location.origin}/joint/${id}`);
    }
  }, [id]);

  useEffect(() => {
    const stored = localStorage.getItem('amigo:joint:name');
    if (stored) setName(stored);
  }, []);

  useEffect(() => {
    if (!name) return;
    localStorage.setItem('amigo:joint:name', name);
  }, [name]);

  useEffect(() => {
    if (!name) return;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('ready');
      setMessages((prev) => prev.concat({ type: 'system', text: 'READY', ts: Date.now() }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as JointEvent;
        if (msg.type === 'burn') {
          setStatus('burned');
          ws.close();
        }
        setMessages((prev) => prev.concat(msg));
      } catch {
        // ignore
      }
    };

    ws.onclose = () => {
      setStatus((prev) => (prev === 'burned' ? prev : 'closed'));
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [name, wsUrl]);

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const payload: JointClientEvent = { type: 'chat', text: trimmed };
    wsRef.current.send(JSON.stringify(payload));
    setText('');
  };

  const burn = async () => {
    await fetch(`${apiBase}/api/joint/${id}/burn`, { method: 'POST' });
    setStatus('burned');
  };

  return (
    <main style={styles.shell}>
      <div style={styles.radar}>
        <span style={{ ...styles.radarRing, animationDelay: '0s' }} />
        <span style={{ ...styles.radarRing, animationDelay: '1.2s' }} />
        <span style={{ ...styles.radarRing, animationDelay: '2.4s' }} />
      </div>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.kicker}>CHANNEL</span>
          <span style={styles.status}>{status === 'ready' ? 'READY' : status.toUpperCase()}</span>
        </div>

        <div style={styles.roomInfo}>
          <div style={styles.roomId}>ID: {id.toUpperCase()}</div>
          <div style={styles.roomLink}>{roomUrl}</div>
        </div>

        <label style={styles.label}>Callsign</label>
        <input
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />

        <div style={styles.log}>
          {messages.map((m, idx) => (
            <div key={idx} style={styles.logRow}>
              {m.type === 'chat' ? (
                <span>
                  <strong>{m.name}:</strong> {m.text}
                </span>
              ) : m.type === 'system' ? (
                <span style={styles.system}>{m.text}</span>
              ) : (
                <span style={styles.system}>BURNED</span>
              )}
            </div>
          ))}
        </div>

        <div style={styles.inputRow}>
          <input
            style={styles.messageInput}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type…"
          />
          <button style={styles.secondaryBtn} onClick={sendMessage}>
            Send
          </button>
        </div>

        <div style={styles.actionRow}>
          <button style={styles.pttBtn} disabled>
            PTT (soon)
          </button>
          <button style={styles.dangerBtn} onClick={burn}>
            Burn
          </button>
        </div>
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
    border: '1px dashed rgba(255,255,255,0.12)',
    animation: 'jointRadarPulse 3.6s ease-out infinite',
    boxShadow: '0 0 24px rgba(255,255,255,0.06)',
  },
  card: {
    width: 'min(640px, 100%)',
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
  roomInfo: {
    display: 'grid',
    gap: 6,
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  roomId: { letterSpacing: '0.2em' },
  roomLink: { wordBreak: 'break-all' },
  label: { fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7 },
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
  log: {
    borderRadius: 14,
    border: '1px solid color-mix(in oklab, var(--border) 70%, transparent)',
    padding: 12,
    minHeight: 140,
    maxHeight: 240,
    overflowY: 'auto',
    background: 'rgba(0,0,0,0.18)',
    fontSize: 13,
  },
  logRow: { marginBottom: 6 },
  system: { color: 'var(--text-muted)', letterSpacing: '0.12em' },
  inputRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 12,
    alignItems: 'center',
  },
  messageInput: {
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
  actionRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 12,
  },
  pttBtn: {
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid color-mix(in oklab, var(--border) 70%, transparent)',
    background: 'rgba(255,255,255,0.04)',
    color: 'var(--text-muted)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  dangerBtn: {
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid color-mix(in oklab, #ff6b6b 30%, var(--border))',
    background: 'color-mix(in oklab, #ff6b6b 10%, rgba(0,0,0,0.2))',
    color: 'var(--text)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    cursor: 'pointer',
  },
};
