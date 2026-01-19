import type { Metadata } from "next";
import RoomClient from "./RoomClient";

type Props = {
  params: { slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

type PeekResponse = {
  exists?: boolean;
  gone?: boolean;
  emoji?: string | null;
  has_url?: boolean;
};

const DEFAULT_SIGNET = "💖";

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
  const base = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000").replace(
    /\/$/,
    ""
  );

  try {
    const res = await fetch(`${base}/api/peek/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as PeekResponse;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const peek = await fetchPeek(params.slug);
  const emoji = peek?.emoji || DEFAULT_SIGNET;
  const gone = peek?.gone || peek?.exists === false;
  const hasUrl = peek?.has_url ?? false;
  const siteUrl = resolveSiteUrl().replace(/\/$/, "");
  const ogUrl = new URL(`/api/og?emoji=${encodeURIComponent(emoji)}`, siteUrl);

  const title = gone
    ? "Urma s-a sters."
    : `Un prieten ${emoji} ți-a trimis asta.`;
  const description = gone
    ? "Momentul a trecut."
    : hasUrl
    ? "Mesaj efemer. O singură deschidere. Respiră și intră."
    : "Mesaj efemer. O singură deschidere. Respiră și intră.";

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [ogUrl.toString()],
    },
  };
}

export default function RoomPage({ params }: Props) {
  return <RoomClient params={params} />;
}
