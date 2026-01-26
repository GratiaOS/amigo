/**
 * Gratia Color Canon
 * ------------------
 *
 * Fiecare signet nu e "o culoare".
 * E un mic climat emotional.
 *
 * Paletele sunt alese manual (nu random),
 * optimizate pentru:
 * - mesaje intime
 * - share pe mobil (WhatsApp / iMessage)
 * - obiecte emotionale (stickere, OG cards, AR tokens)
 *
 * Axele canonice:
 * - bg     -> lume / aer
 * - paper  -> suport / hartie / corp
 * - glow   -> viata / aur / respiratie
 * - ink    -> voce / identitate
 * - shadow -> separare / sticker cut
 */

export type GratiaPalette = {
  bg: string;
  paper: string;
  glow: string;
  ink: string;
  shadow: string;
};

const CANON: Record<string, GratiaPalette> = {
  /**
   * 💖 Gratia Core
   * Dragoste blanda, vinculu, familie.
   * Default-ul sistemului.
   */
  "💖": {
    bg: "#FFF0F5",
    paper: "#FFFAF0",
    glow: "#FFD700",
    ink: "#FF69B4",
    shadow: "rgba(255, 105, 180, 0.35)",
  },

  /**
   * ❤️ Inima intensa
   * Viata, sange, legamant.
   */
  "❤️": {
    bg: "#FFE4E1",
    paper: "#FFF5EE",
    glow: "#FFD700",
    ink: "#DC143C",
    shadow: "rgba(220, 20, 60, 0.35)",
  },

  /**
   * 📦 Fizic / Pachet
   * Lucruri care se misca in lume.
   */
  "📦": {
    bg: "#FFF8E7",
    paper: "#FFEBCD",
    glow: "#FFB84D",
    ink: "#D2691E",
    shadow: "rgba(210, 105, 30, 0.35)",
  },

  /**
   * 📍 Locatie / Intalnire
   * Natura, orientare, munte.
   */
  "📍": {
    bg: "#F0FFF0",
    paper: "#F5FFF5",
    glow: "#90EE90",
    ink: "#228B22",
    shadow: "rgba(34, 139, 34, 0.35)",
  },

  /**
   * 📻 Muzica / Flow
   * Noapte, vibratie, stare.
   */
  "📻": {
    bg: "#F0F8FF",
    paper: "#E6E6FA",
    glow: "#00BFFF",
    ink: "#4B0082",
    shadow: "rgba(75, 0, 130, 0.35)",
  },

  /**
   * 🫧 Efemer / Respiratie
   * Mesaje care nu vor sa ramana.
   */
  "🫧": {
    bg: "#F0FFFF",
    paper: "#F8F8FF",
    glow: "#E0FFFF",
    ink: "#B0E0E6",
    shadow: "rgba(176, 224, 230, 0.35)",
  },

  /**
   * 📜 Document / Cunoastere
   * Lucruri care pot sta in piata.
   */
  "📜": {
    bg: "#FFFDE7",
    paper: "#F5F5DC",
    glow: "#D4A017",
    ink: "#8B6914",
    shadow: "rgba(139, 105, 20, 0.35)",
  },

  /**
   * 🌻 Semn viu (bonus canon)
   * Crestere, copil, casa.
   */
  "🌻": {
    bg: "#FFFFF0",
    paper: "#FFFACD",
    glow: "#FFD700",
    ink: "#FFA500",
    shadow: "rgba(255, 165, 0, 0.35)",
  },
};

// API mic, stabil
export function getPalette(emoji?: string): GratiaPalette {
  if (!emoji) return CANON["💖"];
  return CANON[emoji] || CANON["💖"];
}

export function listCanonSignets(): string[] {
  return Object.keys(CANON);
}

export function isCanonSignet(emoji: string): boolean {
  return emoji in CANON;
}

export const GRATIA_CANON = CANON;
