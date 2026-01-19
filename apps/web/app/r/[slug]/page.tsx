import type { Metadata } from "next";
import { headers } from "next/headers";
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

type OgLang = "en" | "ro" | "es";

const OG_COPY: Record<OgLang, { title: (emoji: string) => string; description: string; goneTitle: string; goneDescription: string; }> = {
  en: {
    title: (emoji) => `A friend ${emoji} sent you this.`,
    description: "Ephemeral message. One opening. Breathe and enter.",
    goneTitle: "The trail faded.",
    goneDescription: "This moment passed.",
  },
  ro: {
    title: (emoji) => `Un prieten ${emoji} ți-a trimis asta.`,
    description: "Mesaj efemer. O singură deschidere. Respiră și intră.",
    goneTitle: "Urma s-a șters.",
    goneDescription: "Momentul a trecut.",
  },
  es: {
    title: (emoji) => `Un amigo ${emoji} te envió esto.`,
    description: "Mensaje efímero. Una sola apertura. Respira y entra.",
    goneTitle: "El rastro se borró.",
    goneDescription: "Este momento pasó.",
  },
};

function detectLang(input?: string | null): OgLang {
  const raw = (input || "").toLowerCase();
  if (raw.includes("ro")) return "ro";
  if (raw.includes("es")) return "es";
  if (raw.includes("en")) return "en";
  return "en";
}

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
  const lang = detectLang(headers().get("accept-language"));
  const copy = OG_COPY[lang];
  const ogUrl = new URL(`/api/og?emoji=${encodeURIComponent(emoji)}`, siteUrl);
  ogUrl.searchParams.set("lang", lang);

  const title = gone
    ? copy.goneTitle
    : copy.title(emoji);
  const description = gone
    ? copy.goneDescription
    : hasUrl
    ? copy.description
    : copy.description;

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
