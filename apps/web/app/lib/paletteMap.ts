export type PaletteKey =
  | "gratia"
  | "package"
  | "scroll"
  | "music"
  | "location"
  | "video"
  | "breath"
  | "intense";

export interface Palette {
  name: string;
  gradient: string;
  shadow: string;
  glow: string;
  text: string;
}

export const paletteMap: Record<PaletteKey, Palette> = {
  gratia: {
    name: "Dawn Paper - High",
    gradient:
      "radial-gradient(circle at 30% 30%, #FFD36A 0%, #FFB97D 25%, #FF8FB1 50%, #FFE8C8 75%, #FFF4E3 100%)",
    shadow: "rgba(255, 107, 107, 0.35)",
    glow: "rgba(255, 214, 122, 0.45)",
    text: "rgba(74, 28, 64, 0.8)",
  },
  package: {
    name: "Amber Move",
    gradient:
      "radial-gradient(circle at 30% 30%, #FFB84D 0%, #FF8C00 40%, #D2691E 70%, #FFF1D6 100%)",
    shadow: "rgba(210, 105, 30, 0.4)",
    glow: "rgba(255, 140, 0, 0.35)",
    text: "rgba(92, 42, 18, 0.8)",
  },
  scroll: {
    name: "Golden Scroll",
    gradient:
      "radial-gradient(circle at 30% 30%, #F5E050 0%, #D4A017 45%, #8B6914 75%, #FFF6D8 100%)",
    shadow: "rgba(212, 160, 23, 0.35)",
    glow: "rgba(245, 224, 80, 0.4)",
    text: "rgba(88, 61, 18, 0.85)",
  },
  music: {
    name: "Midnight Flow",
    gradient:
      "radial-gradient(circle at 30% 30%, #00BFFF 0%, #4B0082 45%, #191970 75%, #F0F4FF 100%)",
    shadow: "rgba(75, 0, 130, 0.4)",
    glow: "rgba(0, 191, 255, 0.35)",
    text: "rgba(18, 18, 48, 0.85)",
  },
  location: {
    name: "Green Postcard",
    gradient:
      "radial-gradient(circle at 30% 30%, #90EE90 0%, #228B22 45%, #556B2F 75%, #F1FFE8 100%)",
    shadow: "rgba(34, 139, 34, 0.35)",
    glow: "rgba(144, 238, 144, 0.35)",
    text: "rgba(28, 61, 28, 0.85)",
  },
  video: {
    name: "Neon Bloom",
    gradient:
      "radial-gradient(circle at 30% 30%, #FF00FF 0%, #00FFFF 40%, #FF4500 70%, #FFF0FA 100%)",
    shadow: "rgba(255, 0, 255, 0.35)",
    glow: "rgba(0, 255, 255, 0.35)",
    text: "rgba(72, 16, 52, 0.85)",
  },
  breath: {
    name: "Soft Air",
    gradient:
      "radial-gradient(circle at 30% 30%, #E0FFFF 0%, #B0E0E6 45%, #F0F8FF 80%, #FFFFFF 100%)",
    shadow: "rgba(176, 224, 230, 0.3)",
    glow: "rgba(224, 255, 255, 0.45)",
    text: "rgba(42, 74, 92, 0.7)",
  },
  intense: {
    name: "Heart Core",
    gradient:
      "radial-gradient(circle at 30% 30%, #FF6347 0%, #DC143C 45%, #8B0000 75%, #FFF0F0 100%)",
    shadow: "rgba(220, 20, 60, 0.4)",
    glow: "rgba(255, 99, 71, 0.4)",
    text: "rgba(74, 12, 12, 0.85)",
  },
};
