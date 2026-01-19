import { ImageResponse } from "next/og";
import { resolvePalette } from "../../lib/resolvePalette";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const emoji = searchParams.get("emoji") || "💖";
  const palette = resolvePalette(emoji);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: palette.gradient,
          color: palette.text,
          fontFamily: "ui-monospace, 'JetBrains Mono', 'IBM Plex Mono', monospace",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 60%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.06), transparent 55%)",
            opacity: 0.9,
          }}
        />

        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 999,
            background: "rgba(255, 255, 255, 0.22)",
            border: "6px solid rgba(255, 255, 255, 0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            zIndex: 2,
            boxShadow: `0 16px 28px ${palette.shadow}, 0 0 60px ${palette.glow}`,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 18,
              left: 22,
              width: 90,
              height: 60,
              borderRadius: 999,
              background:
                "radial-gradient(circle, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.1) 70%, transparent 100%)",
              opacity: 0.7,
            }}
          />
          <div
            style={{
              fontSize: 150,
              lineHeight: 1,
              textShadow:
                "3px 3px 0 rgba(255,255,255,0.9), -3px 3px 0 rgba(255,255,255,0.9), 3px -3px 0 rgba(255,255,255,0.9), -3px -3px 0 rgba(255,255,255,0.9)",
            }}
          >
            {emoji}
          </div>
        </div>

        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            textAlign: "center",
            maxWidth: "80%",
            zIndex: 2,
            padding: "10px 20px",
            borderRadius: 999,
            border: "3px solid rgba(255, 255, 255, 0.85)",
            background: "rgba(255, 255, 255, 0.12)",
            textShadow:
              "2px 2px 0 rgba(255,255,255,0.85), -2px 2px 0 rgba(255,255,255,0.85), 2px -2px 0 rgba(255,255,255,0.85), -2px -2px 0 rgba(255,255,255,0.85)",
          }}
        >
          Un prieten ți-a trimis asta
        </div>

        <div
          style={{
            fontSize: 18,
            marginTop: 18,
            opacity: 0.85,
            zIndex: 2,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          amigo.sh • mesaj efemer
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
