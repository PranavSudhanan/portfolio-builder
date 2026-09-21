/**
 * Font catalogue.
 *
 * Fonts are loaded from Google Fonts by URL rather than `next/font`, because the
 * same font set has to work in three places: the builder preview iframe, the
 * standalone HTML export, and the published page. A plain stylesheet link is the
 * only mechanism available to all three.
 */

export interface FontDef {
  /** Family name exactly as Google Fonts spells it. */
  name: string;
  /** CSS fallback stack appended after the family. */
  stack: string;
  category: "sans" | "serif" | "mono" | "display" | "handwriting";
  /** Weights requested from Google Fonts. */
  weights: number[];
}

export const FONTS: FontDef[] = [
  // Sans
  { name: "Inter", stack: "system-ui, sans-serif", category: "sans", weights: [400, 500, 600, 700, 800] },
  { name: "Manrope", stack: "system-ui, sans-serif", category: "sans", weights: [400, 500, 600, 700, 800] },
  { name: "DM Sans", stack: "system-ui, sans-serif", category: "sans", weights: [400, 500, 700] },
  { name: "Plus Jakarta Sans", stack: "system-ui, sans-serif", category: "sans", weights: [400, 500, 600, 700, 800] },
  { name: "Outfit", stack: "system-ui, sans-serif", category: "sans", weights: [300, 400, 500, 600, 700] },
  { name: "Work Sans", stack: "system-ui, sans-serif", category: "sans", weights: [400, 500, 600, 700] },
  { name: "Figtree", stack: "system-ui, sans-serif", category: "sans", weights: [400, 500, 600, 700, 800] },
  { name: "Sora", stack: "system-ui, sans-serif", category: "sans", weights: [400, 500, 600, 700, 800] },
  { name: "Rubik", stack: "system-ui, sans-serif", category: "sans", weights: [400, 500, 600, 700] },
  { name: "Nunito", stack: "system-ui, sans-serif", category: "sans", weights: [400, 600, 700, 800] },
  { name: "Poppins", stack: "system-ui, sans-serif", category: "sans", weights: [400, 500, 600, 700] },
  { name: "Montserrat", stack: "system-ui, sans-serif", category: "sans", weights: [400, 500, 600, 700, 800] },
  { name: "Raleway", stack: "system-ui, sans-serif", category: "sans", weights: [400, 500, 600, 700] },
  { name: "Lato", stack: "system-ui, sans-serif", category: "sans", weights: [400, 700, 900] },
  { name: "Open Sans", stack: "system-ui, sans-serif", category: "sans", weights: [400, 600, 700] },

  // Display
  { name: "Space Grotesk", stack: "system-ui, sans-serif", category: "display", weights: [400, 500, 600, 700] },
  { name: "Bricolage Grotesque", stack: "system-ui, sans-serif", category: "display", weights: [400, 600, 700, 800] },
  { name: "Clash Display", stack: "system-ui, sans-serif", category: "display", weights: [400, 600, 700] },
  { name: "Syne", stack: "system-ui, sans-serif", category: "display", weights: [400, 600, 700, 800] },
  { name: "Unbounded", stack: "system-ui, sans-serif", category: "display", weights: [400, 600, 700] },
  { name: "Archivo Black", stack: "system-ui, sans-serif", category: "display", weights: [400] },
  { name: "Bebas Neue", stack: "system-ui, sans-serif", category: "display", weights: [400] },
  { name: "Anton", stack: "system-ui, sans-serif", category: "display", weights: [400] },

  // Serif
  { name: "Playfair Display", stack: "Georgia, serif", category: "serif", weights: [400, 500, 600, 700, 800] },
  { name: "Fraunces", stack: "Georgia, serif", category: "serif", weights: [400, 500, 600, 700, 900] },
  { name: "Instrument Serif", stack: "Georgia, serif", category: "serif", weights: [400] },
  { name: "Lora", stack: "Georgia, serif", category: "serif", weights: [400, 500, 600, 700] },
  { name: "Merriweather", stack: "Georgia, serif", category: "serif", weights: [400, 700, 900] },
  { name: "Source Serif 4", stack: "Georgia, serif", category: "serif", weights: [400, 600, 700] },
  { name: "Libre Baskerville", stack: "Georgia, serif", category: "serif", weights: [400, 700] },
  { name: "Cormorant Garamond", stack: "Georgia, serif", category: "serif", weights: [400, 500, 600, 700] },
  { name: "EB Garamond", stack: "Georgia, serif", category: "serif", weights: [400, 500, 600, 700] },
  { name: "Spectral", stack: "Georgia, serif", category: "serif", weights: [400, 500, 600, 700] },

  // Mono
  { name: "JetBrains Mono", stack: "ui-monospace, monospace", category: "mono", weights: [400, 500, 700] },
  { name: "IBM Plex Mono", stack: "ui-monospace, monospace", category: "mono", weights: [400, 500, 600] },
  { name: "Space Mono", stack: "ui-monospace, monospace", category: "mono", weights: [400, 700] },
  { name: "Fira Code", stack: "ui-monospace, monospace", category: "mono", weights: [400, 500, 600] },
  { name: "Roboto Mono", stack: "ui-monospace, monospace", category: "mono", weights: [400, 500, 700] },

  // Handwriting
  { name: "Caveat", stack: "cursive", category: "handwriting", weights: [400, 600, 700] },
  { name: "Dancing Script", stack: "cursive", category: "handwriting", weights: [400, 600, 700] },
];

/** Families Google Fonts does not serve — skipped when building the href. */
const NOT_ON_GOOGLE = new Set(["Clash Display"]);

const BY_NAME = new Map(FONTS.map((f) => [f.name, f]));

export function getFont(name: string): FontDef {
  return BY_NAME.get(name) ?? FONTS[0];
}

/** Full CSS `font-family` value for a family name. */
export function fontStack(name: string): string {
  const font = getFont(name);
  return `"${font.name}", ${font.stack}`;
}

/**
 * Build one Google Fonts stylesheet URL covering every family passed in.
 * Returns an empty string when none of them are hosted on Google Fonts.
 */
export function googleFontsHref(families: string[]): string {
  const unique = Array.from(new Set(families.filter(Boolean)));
  const params = unique
    .map((name) => BY_NAME.get(name))
    .filter((f): f is FontDef => Boolean(f) && !NOT_ON_GOOGLE.has(f!.name))
    .map((f) => {
      const weights = f.weights.join(";");
      return `family=${encodeURIComponent(f.name).replace(/%20/g, "+")}:wght@${weights}`;
    });
  if (params.length === 0) return "";
  return `https://fonts.googleapis.com/css2?${params.join("&")}&display=swap`;
}

export const FONT_CATEGORIES: { value: FontDef["category"]; label: string }[] = [
  { value: "sans", label: "Sans serif" },
  { value: "display", label: "Display" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Monospace" },
  { value: "handwriting", label: "Handwriting" },
];

/** Curated heading + body pairings offered as one-click choices. */
export const FONT_PAIRINGS: { label: string; heading: string; body: string }[] = [
  { label: "Modern default", heading: "Inter", body: "Inter" },
  { label: "Technical", heading: "Space Grotesk", body: "Inter" },
  { label: "Editorial", heading: "Playfair Display", body: "Lora" },
  { label: "Bold statement", heading: "Bricolage Grotesque", body: "Work Sans" },
  { label: "Soft & friendly", heading: "Outfit", body: "Nunito" },
  { label: "Classic serif", heading: "Fraunces", body: "Source Serif 4" },
  { label: "Corporate", heading: "Manrope", body: "Open Sans" },
  { label: "Fashion", heading: "Syne", body: "DM Sans" },
  { label: "Academic", heading: "EB Garamond", body: "Spectral" },
  { label: "Developer", heading: "JetBrains Mono", body: "IBM Plex Mono" },
  { label: "Poster", heading: "Anton", body: "Figtree" },
  { label: "Luxury", heading: "Cormorant Garamond", body: "Montserrat" },
];
