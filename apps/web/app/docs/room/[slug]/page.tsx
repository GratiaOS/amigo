type Props = {
  params: { slug: string };
};

type PeekResponse = {
  emoji?: string | null;
  note?: string | null;
};

const DEFAULT_SIGNET = "💖";
const DEFAULT_CALLSIGN = "@garden";

function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_WEB_BASE) {
    return process.env.NEXT_PUBLIC_WEB_BASE;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3001";
}

async function fetchPeek(slug: string): Promise<PeekResponse | null> {
  const base = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000").replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/api/peek/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as PeekResponse;
  } catch {
    return null;
  }
}

export default async function PosterRoom({ params }: Props) {
  const peek = await fetchPeek(params.slug);
  const signet = peek?.emoji || DEFAULT_SIGNET;
  const note = peek?.note?.trim();
  const siteUrl = resolveSiteUrl().replace(/\/$/, "");
  const link = `${siteUrl}/${DEFAULT_CALLSIGN}/${params.slug}`;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "8vh 6vw",
        background: "#f7f1e6",
        color: "#2a2218",
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
      }}
    >
      <div
        style={{
          width: "min(680px, 100%)",
          border: "2px solid #2a2218",
          padding: "48px 40px",
          borderRadius: 24,
          background: "#fffaf2",
          boxShadow: "12px 12px 0 rgba(0,0,0,0.15)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 18 }}>{signet}</div>
        <div style={{ fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.7 }}>
          One-time room
        </div>
        <h1 style={{ fontSize: 28, margin: "20px 0 10px" }}>amigo.sh</h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, fontStyle: "italic", margin: "16px 0 28px" }}>
          {note ? `"${note}"` : "\"...\""}
        </p>
        <div
          style={{
            display: "inline-block",
            padding: "10px 16px",
            borderRadius: 999,
            border: "1px solid #2a2218",
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {link}
        </div>
      </div>
    </main>
  );
}
