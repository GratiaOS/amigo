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

  const title = gone
    ? "Urma s-a sters."
    : `${emoji} Un prieten ti-a trimis ceva.`;
  const description = gone
    ? "Momentul a trecut."
    : hasUrl
    ? "Respira si intra."
    : "Mesaj efemer - o singura citire.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default function RoomPage({ params }: Props) {
  return <RoomClient params={params} />;
}
