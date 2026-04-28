/**
 * Theme palettes for Score Canvas.
 *
 * Four presets tuned for serious work: Dark (the default), Light, SUPER DARK
 * (near-black, max-focus), and BRIGHT AS FUCK (daylit, high-contrast).
 *
 * Each palette is six RGB triplets (whitespace-separated, no commas) so they
 * can be slotted into the CSS-variable + Tailwind alpha-channel pattern:
 *
 *   --c-bg: 26 26 46;  →  rgb(var(--c-bg) / <alpha-value>)  →  bg-canvas-bg/80
 */

export type ThemeId =
  | "score-canvas"
  | "light"
  | "super-dark"
  | "bright-as-fuck";

export interface ThemeDef {
  id: ThemeId;
  label: string;
  /** Short tagline shown in the picker. */
  tagline: string;
  /** RGB triplets, space-separated. */
  vars: {
    bg: string;
    surface: string;
    accent: string;
    highlight: string;
    text: string;
    muted: string;
  };
  /** A second accent color used for SEGUE pill / variant accents. */
  accentAlt: string;
}

export const THEMES: ThemeDef[] = [
  {
    id: "score-canvas",
    label: "Dark",
    tagline: "Default · teal-blue",
    vars: {
      bg:        "26 26 46",
      surface:   "22 33 62",
      accent:    "15 52 96",
      highlight: "78 205 196",
      text:      "234 234 234",
      muted:     "136 146 164",
    },
    accentAlt: "168 85 247",
  },
  {
    id: "light",
    label: "Light",
    tagline: "Studio · soft paper",
    vars: {
      bg:        "248 244 236",
      surface:   "252 248 240",
      accent:    "224 214 196",
      highlight: "180 100 70",
      text:      "60 50 40",
      muted:     "140 124 108",
    },
    accentAlt: "168 100 60",
  },
  {
    id: "super-dark",
    label: "SUPER DARK",
    tagline: "Near-black · minimal distraction",
    vars: {
      bg:        "8 8 12",
      surface:   "16 16 24",
      accent:    "24 24 40",
      highlight: "100 255 200",
      text:      "245 245 250",
      muted:     "120 120 140",
    },
    accentAlt: "255 100 150",
  },
  {
    id: "bright-as-fuck",
    label: "BRIGHT AS FUCK",
    tagline: "Daylit · high contrast",
    vars: {
      bg:        "250 250 252",
      surface:   "240 240 245",
      accent:    "200 200 220",
      highlight: "0 150 200",
      text:      "20 20 40",
      muted:     "100 100 120",
    },
    accentAlt: "220 80 120",
  },
];

export const DEFAULT_THEME_ID: ThemeId = "score-canvas";

export function getTheme(id: ThemeId): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
