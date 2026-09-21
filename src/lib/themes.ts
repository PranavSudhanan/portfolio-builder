import type { Theme, ThemePreset } from "./types";

/**
 * Colour presets.
 *
 * Every preset supplies a complete palette so switching preset never leaves a
 * half-applied theme. Palettes are hand-tuned for text contrast: `text` on `bg`
 * clears WCAG AA at body sizes, and `onPrimary` clears AA on `primary`.
 */
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "midnight",
    name: "Midnight",
    mode: "dark",
    vibe: "Deep indigo, violet accent",
    palette: {
      bg: "#0b0f19",
      surface: "#121829",
      elevated: "#1a2136",
      text: "#eef1f8",
      muted: "#9aa3bd",
      border: "#232b44",
      primary: "#8b7cff",
      onPrimary: "#0b0f19",
      secondary: "#34d5f0",
      accent: "#f0a44a",
    },
    gradient: { from: "#8b7cff", to: "#34d5f0" },
  },
  {
    id: "paper",
    name: "Paper",
    mode: "light",
    vibe: "Warm off-white, ink black",
    palette: {
      bg: "#faf9f6",
      surface: "#ffffff",
      elevated: "#f2f0ea",
      text: "#16150f",
      muted: "#6b6759",
      border: "#e2ded2",
      primary: "#16150f",
      onPrimary: "#faf9f6",
      secondary: "#8a6d3b",
      accent: "#c2410c",
    },
    gradient: { from: "#16150f", to: "#6b6759" },
  },
  {
    id: "arctic",
    name: "Arctic",
    mode: "light",
    vibe: "Cool white, electric blue",
    palette: {
      bg: "#f7f9fc",
      surface: "#ffffff",
      elevated: "#eef3fa",
      text: "#0f172a",
      muted: "#5b6880",
      border: "#dce5f1",
      primary: "#2563eb",
      onPrimary: "#ffffff",
      secondary: "#0891b2",
      accent: "#7c3aed",
    },
    gradient: { from: "#2563eb", to: "#06b6d4" },
  },
  {
    id: "forest",
    name: "Forest",
    mode: "dark",
    vibe: "Charcoal green, moss accent",
    palette: {
      bg: "#0c1210",
      surface: "#121b18",
      elevated: "#1a2622",
      text: "#e8f0ec",
      muted: "#93a89f",
      border: "#223029",
      primary: "#4ade80",
      onPrimary: "#08120d",
      secondary: "#a3e635",
      accent: "#f5b942",
    },
    gradient: { from: "#4ade80", to: "#a3e635" },
  },
  {
    id: "sunset",
    name: "Sunset",
    mode: "dark",
    vibe: "Plum night, coral glow",
    palette: {
      bg: "#150e18",
      surface: "#1f1424",
      elevated: "#2b1c32",
      text: "#f8eef5",
      muted: "#b69ab0",
      border: "#38243f",
      primary: "#fb7185",
      onPrimary: "#1a0c14",
      secondary: "#fbbf24",
      accent: "#c084fc",
    },
    gradient: { from: "#fb7185", to: "#fbbf24" },
  },
  {
    id: "mono",
    name: "Monochrome",
    mode: "light",
    vibe: "Pure greyscale, zero colour",
    palette: {
      bg: "#ffffff",
      surface: "#fafafa",
      elevated: "#f1f1f1",
      text: "#0a0a0a",
      muted: "#6e6e6e",
      border: "#e3e3e3",
      primary: "#0a0a0a",
      onPrimary: "#ffffff",
      secondary: "#525252",
      accent: "#0a0a0a",
    },
    gradient: { from: "#0a0a0a", to: "#6e6e6e" },
  },
  {
    id: "noir",
    name: "Noir",
    mode: "dark",
    vibe: "True black, white type",
    palette: {
      bg: "#000000",
      surface: "#0c0c0c",
      elevated: "#161616",
      text: "#f5f5f5",
      muted: "#9b9b9b",
      border: "#252525",
      primary: "#ffffff",
      onPrimary: "#000000",
      secondary: "#a3a3a3",
      accent: "#facc15",
    },
    gradient: { from: "#ffffff", to: "#a3a3a3" },
  },
  {
    id: "sand",
    name: "Sand",
    mode: "light",
    vibe: "Desert neutrals, terracotta",
    palette: {
      bg: "#fdf8f3",
      surface: "#ffffff",
      elevated: "#f5ece1",
      text: "#2a1d14",
      muted: "#7a6552",
      border: "#e9dbcb",
      primary: "#b45309",
      onPrimary: "#fffaf5",
      secondary: "#0f766e",
      accent: "#9a3412",
    },
    gradient: { from: "#b45309", to: "#ea9a4a" },
  },
  {
    id: "royal",
    name: "Royal",
    mode: "dark",
    vibe: "Navy and gold, formal",
    palette: {
      bg: "#0a1022",
      surface: "#111a33",
      elevated: "#182444",
      text: "#eef2ff",
      muted: "#94a3c4",
      border: "#1f2d52",
      primary: "#d4af37",
      onPrimary: "#0a1022",
      secondary: "#60a5fa",
      accent: "#f8fafc",
    },
    gradient: { from: "#d4af37", to: "#f5e6a8" },
  },
  {
    id: "bubblegum",
    name: "Bubblegum",
    mode: "light",
    vibe: "Playful pink and violet",
    palette: {
      bg: "#fff5fa",
      surface: "#ffffff",
      elevated: "#ffe9f3",
      text: "#3b0d26",
      muted: "#8d5a75",
      border: "#fbd3e4",
      primary: "#db2777",
      onPrimary: "#ffffff",
      secondary: "#7c3aed",
      accent: "#f59e0b",
    },
    gradient: { from: "#db2777", to: "#8b5cf6" },
  },
  {
    id: "matrix",
    name: "Matrix",
    mode: "dark",
    vibe: "Terminal green on black",
    palette: {
      bg: "#050807",
      surface: "#0a110d",
      elevated: "#101b14",
      text: "#c8facc",
      muted: "#5f9c6d",
      border: "#16301f",
      primary: "#22c55e",
      onPrimary: "#04120a",
      secondary: "#14b8a6",
      accent: "#a3e635",
    },
    gradient: { from: "#22c55e", to: "#14b8a6" },
  },
  {
    id: "slate",
    name: "Slate",
    mode: "light",
    vibe: "Corporate grey-blue",
    palette: {
      bg: "#f8fafc",
      surface: "#ffffff",
      elevated: "#eef2f7",
      text: "#1e293b",
      muted: "#64748b",
      border: "#dfe6ee",
      primary: "#0f766e",
      onPrimary: "#ffffff",
      secondary: "#1d4ed8",
      accent: "#b45309",
    },
    gradient: { from: "#0f766e", to: "#2dd4bf" },
  },
  {
    id: "cocoa",
    name: "Cocoa",
    mode: "dark",
    vibe: "Warm brown, cream type",
    palette: {
      bg: "#17120f",
      surface: "#211a15",
      elevated: "#2d231c",
      text: "#f5ece3",
      muted: "#b09c8a",
      border: "#3a2d24",
      primary: "#e8b88a",
      onPrimary: "#1c140f",
      secondary: "#d97706",
      accent: "#84cc16",
    },
    gradient: { from: "#e8b88a", to: "#d97706" },
  },
  {
    id: "lagoon",
    name: "Lagoon",
    mode: "dark",
    vibe: "Teal depths, aqua light",
    palette: {
      bg: "#05161a",
      surface: "#0a2128",
      elevated: "#0f2d36",
      text: "#e0f7fa",
      muted: "#8fb5bd",
      border: "#154049",
      primary: "#22d3ee",
      onPrimary: "#04161a",
      secondary: "#38bdf8",
      accent: "#fda4af",
    },
    gradient: { from: "#22d3ee", to: "#3b82f6" },
  },
];

export const THEME_PRESETS_BY_ID = new Map(THEME_PRESETS.map((p) => [p.id, p]));

/** The theme every new document starts from. */
export function defaultTheme(): Theme {
  const preset = THEME_PRESETS_BY_ID.get("midnight")!;
  return {
    presetId: preset.id,
    mode: preset.mode,
    palette: { ...preset.palette },
    headingFont: "Space Grotesk",
    bodyFont: "Inter",
    monoFont: "JetBrains Mono",
    headingWeight: 700,
    headingCase: "none",
    fontScale: "normal",
    letterSpacing: -0.01,
    lineHeight: 1.65,
    radius: 14,
    density: "normal",
    container: "full",
    shadow: "soft",
    buttonStyle: "solid",
    cardStyle: "bordered",
    gradient: { enabled: true, from: preset.gradient.from, to: preset.gradient.to, angle: 120 },
    backdrop: { pattern: "mesh", opacity: 0.5 },
    animations: true,
    customCss: "",
  };
}

/**
 * Pick a sensible opposite-mode preset to pair with `presetId`.
 *
 * Used as the default for the visitor-facing theme toggle so a new document
 * ships with a light/dark pair that actually looks deliberate.
 */
const COUNTERPARTS: Record<string, string> = {
  midnight: "arctic",
  arctic: "midnight",
  paper: "noir",
  noir: "paper",
  mono: "noir",
  forest: "sand",
  sand: "forest",
  sunset: "bubblegum",
  bubblegum: "sunset",
  royal: "slate",
  slate: "royal",
  matrix: "mono",
  cocoa: "sand",
  lagoon: "arctic",
};

export function counterpartPreset(presetId: string): string {
  if (COUNTERPARTS[presetId]) return COUNTERPARTS[presetId];
  const preset = THEME_PRESETS_BY_ID.get(presetId);
  const opposite = THEME_PRESETS.find((p) => p.mode !== preset?.mode);
  return opposite?.id ?? "paper";
}

/** Apply a colour preset on top of an existing theme, keeping type and layout. */
export function applyThemePreset(theme: Theme, presetId: string): Theme {
  const preset = THEME_PRESETS_BY_ID.get(presetId);
  if (!preset) return theme;
  return {
    ...theme,
    presetId: preset.id,
    mode: preset.mode,
    palette: { ...preset.palette },
    gradient: { ...theme.gradient, from: preset.gradient.from, to: preset.gradient.to },
  };
}
