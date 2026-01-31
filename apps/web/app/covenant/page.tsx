export default function CovenantPage() {
  return (
    <main style={styles.shell}>
      <section style={styles.card}>
        <p style={styles.kicker}>COVENANT</p>
        <h1 style={styles.title}>Grădina</h1>
        <ol style={styles.list}>
          <li>Prezență reală, nu performanță.</li>
          <li>Fără scor — dăm pentru că suntem.</li>
          <li>Ardem ce nu mai ține, fără vină.</li>
          <li>Respect pentru Miez (Low Energy, Survival Mode).</li>
          <li>„Sunt aici”, nu „Totul va fi bine”.</li>
        </ol>
        <p style={styles.note}>Confirmă dacă ești de acord.</p>
        <p style={styles.note}>Dacă nu — e ok, dar nu e locul tău.</p>
        <a href="/joint" style={styles.back}>
          Înapoi la /joint
        </a>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--page-bg)',
    color: 'var(--text)',
    padding: 24,
    fontFamily: 'inherit',
  },
  card: {
    width: 'min(560px, 100%)',
    padding: 24,
    borderRadius: 22,
    border: '1px solid color-mix(in oklab, var(--border) 70%, transparent)',
    background: 'rgba(15,15,14,0.72)',
    backdropFilter: 'blur(14px)',
    boxShadow: '0 32px 60px rgba(0,0,0,0.35)',
    display: 'grid',
    gap: 12,
  },
  kicker: {
    margin: 0,
    fontSize: 11,
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  },
  title: {
    margin: 0,
    fontSize: 24,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  list: {
    margin: 0,
    paddingLeft: 18,
    display: 'grid',
    gap: 8,
    fontSize: 14,
    color: 'var(--text)',
  },
  note: {
    margin: 0,
    fontSize: 13,
    color: 'var(--text-muted)',
  },
  back: {
    marginTop: 8,
    fontSize: 12,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text)',
    textDecoration: 'none',
    alignSelf: 'start',
  },
};
