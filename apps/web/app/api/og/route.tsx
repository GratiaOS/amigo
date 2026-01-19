import { ImageResponse } from "next/og";
import { getPalette } from "../../lib/signets/palettes";

export const runtime = "edge";

type OgLang = "en" | "ro" | "es";

const OG_COPY: Record<OgLang, { title: string; footer: string }> = {
  en: {
    title: "A friend sent you this",
    footer: "ephemeral message",
  },
  ro: {
    title: "Un prieten ți-a trimis asta",
    footer: "mesaj efemer",
  },
  es: {
    title: "Un amigo te envió esto",
    footer: "mensaje efímero",
  },
};

function detectLang(input?: string | null): OgLang {
  const raw = (input || "").toLowerCase();
  if (raw.includes("ro")) return "ro";
  if (raw.includes("es")) return "es";
  if (raw.includes("en")) return "en";
  return "en";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const emoji = searchParams.get("emoji") || "💖";
  const lang = detectLang(searchParams.get("lang") || request.headers.get("accept-language"));
  const copy = OG_COPY[lang];

  const palette = getPalette(emoji);

  const bgGradient = `radial-gradient(circle at 30% 25%, ${palette.glow} 0%, ${palette.paper} 35%, ${palette.bg} 70%, ${palette.bg} 100%)`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: bgGradient,
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.18,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            mixBlendMode: "overlay",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: palette.glow,
            filter: "blur(120px)",
            top: -120,
            left: -80,
            opacity: 0.35,
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: palette.glow,
            filter: "blur(140px)",
            bottom: -120,
            right: -80,
            opacity: 0.25,
          }}
        />

        <div
          style={{
            width: 260,
            height: 260,
            borderRadius: 999,
            background: "rgba(255,255,255,0.25)",
            border: "6px solid rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
            boxShadow: `0 22px 40px ${palette.shadow}`,
            filter: `drop-shadow(0 18px 34px ${palette.shadow})`,
            backdropFilter: "blur(6px)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              fontSize: 170,
              filter: `drop-shadow(0 10px 18px ${palette.shadow})`,
              opacity: 0.35,
            }}
          >
            {emoji}
          </div>

          <div
            style={{
              fontSize: 150,
              lineHeight: 1,
              textShadow:
                "3px 3px 0 rgba(255,255,255,0.95), -3px 3px 0 rgba(255,255,255,0.95), 3px -3px 0 rgba(255,255,255,0.95), -3px -3px 0 rgba(255,255,255,0.95)",
              zIndex: 2,
            }}
          >
            {emoji}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 120,
            padding: "12px 26px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.22)",
            border: "3px solid rgba(255,255,255,0.9)",
            fontSize: 42,
            fontWeight: 700,
            color: palette.ink,
            textShadow:
              "2px 2px 0 rgba(255,255,255,0.85), -2px 2px 0 rgba(255,255,255,0.85), 2px -2px 0 rgba(255,255,255,0.85), -2px -2px 0 rgba(255,255,255,0.85)",
            zIndex: 5,
          }}
        >
          {copy.title}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: 0.75,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: palette.ink,
            }}
          >
            amigo.sh
          </div>
          <div
            style={{
              fontSize: 14,
              marginTop: 6,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: palette.ink,
            }}
          >
            {copy.footer}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
