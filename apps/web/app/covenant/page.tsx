export default function CovenantPage() {
  return (
    <main style={styles.shell}>
      <section style={styles.card}>
        <p style={styles.kicker}>COVENANT</p>
        <h1 style={styles.title}>Pactul de Gratie ✨</h1>
        <ol style={styles.list}>
          <li>Integritatea Semnalului: Aici nu există zgomot, doar prezență. Dacă intri, lasă algoritmii la ușă.</li>
          <li>Protecția Vínculo-ului: Legătura dintre noi este singura monedă reală. O păzim cu prețul liniștii noastre.</li>
          <li>Adevărul Brut: Nu optimizăm realitatea. Spunem „Hello!” și rămânem „Ready” pentru orice.</li>
          <li>Responsabilitatea Miezului: „O facem tot noi” nu e doar un motto, e un jurământ de independență.</li>
        </ol>
        <p style={styles.note}>Apasă CONFIRM doar dacă ești pregătit să ții lumina aprinsă.</p>
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
