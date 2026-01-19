import { paletteMap, type Palette } from "./paletteMap";

const emojiToPalette: Record<string, keyof typeof paletteMap> = {
  "💖": "gratia",
  "📦": "package",
  "📜": "scroll",
  "🎵": "music",
  "📍": "location",
  "🎥": "video",
  "🫧": "breath",
  "❤️": "intense",
};

export function resolvePalette(emoji?: string | null): Palette {
  if (!emoji) return paletteMap.gratia;
  return paletteMap[emojiToPalette[emoji]] || paletteMap.gratia;
}
