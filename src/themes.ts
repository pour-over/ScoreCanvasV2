/**
 * Theme palettes for Score Canvas.
 *
 * Each theme is a small set of nominative-fair-use color nods to recognizable
 * audio tools — the names are theme labels only, not affiliations or trademarks.
 * Color palettes themselves aren't copyrightable; we're just paying respect.
 *
 * Each palette is six RGB triplets (whitespace-separated, no commas) so they
 * can be slotted into the CSS-variable + Tailwind alpha-channel pattern:
 *
 *   --c-bg: 26 26 46;  →  rgb(var(--c-bg) / <alpha-value>)  →  bg-canvas-bg/80
 */

export type ThemeId =
  | "score-canvas"
  | "pro-tools"
  | "logic"
  | "ableton"
  | "fl-studio"
  | "reaper"
  | "wwise"
  | "winamp";

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
    label: "Score Canvas",
    tagline: "Default · dark teal-blue",
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
    id: "pro-tools",
    label: "Pro Tools",
    tagline: "Studio gray · transport red",
    vars: {
      bg:        "30 30 30",
      surface:   "45 45 45",
      accent:    "65 65 65",
      highlight: "220 50 47",
      text:      "220 220 220",
      muted:     "140 140 140",
    },
    accentAlt: "245 158 11",
  },
  {
    id: "logic",
    label: "Logic",
    tagline: "Graphite · Mac blue",
    vars: {
      bg:        "24 24 26",
      surface:   "38 38 42",
      accent:    "60 60 70",
      highlight: "90 158 245",
      text:      "230 230 235",
      muted:     "145 145 155",
    },
    accentAlt: "255 159 10",
  },
  {
    id: "ableton",
    label: "Ableton",
    tagline: "Warm dark · signature orange",
    vars: {
      bg:        "32 32 32",
      surface:   "50 50 50",
      accent:    "70 70 70",
      highlight: "255 152 0",
      text:      "240 240 240",
      muted:     "155 155 155",
    },
    accentAlt: "121 204 211",
  },
  {
    id: "fl-studio",
    label: "FL Studio",
    tagline: "Producer pink · deep navy",
    vars: {
      bg:        "22 22 30",
      surface:   "35 35 45",
      accent:    "55 55 70",
      highlight: "255 75 145",
      text:      "235 235 240",
      muted:     "145 145 165",
    },
    accentAlt: "125 211 252",
  },
  {
    id: "reaper",
    label: "Reaper",
    tagline: "Terminal green · matte dark",
    vars: {
      bg:        "18 22 18",
      surface:   "28 36 28",
      accent:    "45 60 45",
      highlight: "80 220 100",
      text:      "215 230 215",
      muted:     "130 150 130",
    },
    accentAlt: "250 204 21",
  },
  {
    id: "wwise",
    label: "Wwise",
    tagline: "Game audio · authoring orange",
    vars: {
      bg:        "28 28 32",
      surface:   "42 42 48",
      accent:    "60 60 70",
      highlight: "244 130 32",
      text:      "230 230 235",
      muted:     "150 150 160",
    },
    accentAlt: "94 234 212",
  },
  {
    id: "winamp",
    label: "Winamp Classic",
    tagline: "It really whips · LCD lime",
    vars: {
      bg:        "22 22 22",
      surface:   "38 38 38",
      accent:    "60 60 60",
      highlight: "144 238 144",
      text:      "230 230 230",
      muted:     "140 140 140",
    },
    accentAlt: "255 191 0",
  },
];

export const DEFAULT_THEME_ID: ThemeId = "score-canvas";

export function getTheme(id: ThemeId): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
