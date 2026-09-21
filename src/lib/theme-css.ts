import { fontStack } from "./fonts";
import type { Theme } from "./types";
import { readableOn, shade, withAlpha } from "./utils";

/**
 * Theme → CSS custom properties.
 *
 * Every visual decision in the rendered portfolio reads from one of these
 * variables, which is what lets any theme combine with any template. The same
 * map is used three ways: as inline styles in the live preview, as a `:root`
 * block in the standalone HTML export, and on the published page.
 */

const FONT_SCALE: Record<Theme["fontScale"], { base: number; ratio: number }> = {
  compact: { base: 15, ratio: 1.2 },
  normal: { base: 16, ratio: 1.25 },
  comfortable: { base: 17, ratio: 1.28 },
  grand: { base: 18, ratio: 1.34 },
};

const DENSITY: Record<Theme["density"], { section: number; gap: number }> = {
  tight: { section: 56, gap: 16 },
  normal: { section: 88, gap: 24 },
  airy: { section: 128, gap: 36 },
};

/**
 * How wide the content is allowed to grow.
 *
 * Full width is the default now. Every fixed number here was a compromise with
 * some particular screen: 1240px looked generous on a laptop and left a third
 * of a 1920px display empty, which reads as a site stranded in the middle of
 * the page rather than a deliberate margin. The layout is fluid instead, and
 * the padding below scales with the viewport so full-bleed still breathes.
 *
 * The fixed widths remain for the layouts that genuinely want a column —
 * prose keeps its own `max-width` in ch regardless, so text never runs to an
 * uncomfortable line length whichever of these is chosen.
 */
const CONTAINER: Record<Theme["container"], string> = {
  narrow: "1100px",
  normal: "1440px",
  wide: "1800px",
  full: "100%",
};

const SHADOW: Record<Theme["shadow"], { sm: string; md: string; lg: string }> = {
  none: { sm: "none", md: "none", lg: "none" },
  soft: {
    sm: "0 1px 2px rgba(0,0,0,0.06)",
    md: "0 4px 16px -4px rgba(0,0,0,0.12)",
    lg: "0 18px 48px -18px rgba(0,0,0,0.28)",
  },
  medium: {
    sm: "0 2px 4px rgba(0,0,0,0.10)",
    md: "0 10px 28px -8px rgba(0,0,0,0.22)",
    lg: "0 28px 68px -22px rgba(0,0,0,0.42)",
  },
  strong: {
    sm: "0 3px 6px rgba(0,0,0,0.16)",
    md: "0 18px 44px -10px rgba(0,0,0,0.34)",
    lg: "0 40px 90px -24px rgba(0,0,0,0.58)",
  },
};

/** Decorative page backdrops, drawn as layered CSS gradients behind content. */
function backdropImage(theme: Theme): string {
  const { pattern } = theme.backdrop;
  const line = withAlpha(theme.palette.text, theme.mode === "dark" ? 0.09 : 0.07);
  const g1 = withAlpha(theme.gradient.from, theme.mode === "dark" ? 0.3 : 0.17);
  const g2 = withAlpha(theme.gradient.to, theme.mode === "dark" ? 0.26 : 0.15);
  const g3 = withAlpha(theme.palette.accent, theme.mode === "dark" ? 0.18 : 0.1);

  switch (pattern) {
    case "dots":
      return `radial-gradient(${line} 1px, transparent 1px)`;
    case "grid":
      return `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`;
    case "mesh":
      return [
        `radial-gradient(760px circle at 8% 4%, ${g1}, transparent 46%)`,
        `radial-gradient(680px circle at 94% 12%, ${g2}, transparent 44%)`,
        `radial-gradient(720px circle at 50% 96%, ${g3}, transparent 48%)`,
      ].join(", ");
    case "rays":
      return `conic-gradient(from 210deg at 50% -10%, ${g1}, transparent 28%, ${g2} 52%, transparent 76%, ${g1})`;
    case "waves":
      return [
        `radial-gradient(1200px 300px at 50% 0%, ${g1}, transparent 70%)`,
        `radial-gradient(900px 280px at 10% 60%, ${g2}, transparent 70%)`,
        `radial-gradient(900px 280px at 90% 100%, ${g3}, transparent 70%)`,
      ].join(", ");
    case "noise": {
      // An inline SVG turbulence tile — no network request, works offline in exports.
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3"/></filter><rect width="140" height="140" filter="url(%23n)" opacity="0.5"/></svg>`;
      return `url("data:image/svg+xml,${svg.replace(/#/g, "%23").replace(/"/g, "'")}")`;
    }
    default:
      return "none";
  }
}

function backdropSize(theme: Theme): string {
  switch (theme.backdrop.pattern) {
    case "dots":
      return "22px 22px";
    case "grid":
      return "56px 56px, 56px 56px";
    case "noise":
      return "140px 140px";
    default:
      return "auto";
  }
}

const HEADING_CASE: Record<Theme["headingCase"], string> = {
  none: "none",
  upper: "uppercase",
  title: "capitalize",
};

/** The full variable map for a theme. Values are plain CSS strings. */
export function themeVars(theme: Theme): Record<string, string> {
  const p = theme.palette;
  const scale = FONT_SCALE[theme.fontScale] ?? FONT_SCALE.normal;
  const density = DENSITY[theme.density] ?? DENSITY.normal;
  const shadow = SHADOW[theme.shadow] ?? SHADOW.soft;
  const isDark = theme.mode === "dark";

  const size = (step: number) => `${(scale.base * scale.ratio ** step).toFixed(2)}px`;

  const gradient = theme.gradient.enabled
    ? `linear-gradient(${theme.gradient.angle}deg, ${theme.gradient.from}, ${theme.gradient.to})`
    : `linear-gradient(${theme.gradient.angle}deg, ${p.primary}, ${p.primary})`;

  return {
    "--pf-bg": p.bg,
    "--pf-surface": p.surface,
    "--pf-elevated": p.elevated,
    "--pf-text": p.text,
    "--pf-muted": p.muted,
    "--pf-border": p.border,
    "--pf-primary": p.primary,
    "--pf-on-primary": p.onPrimary || readableOn(p.primary),
    "--pf-secondary": p.secondary,
    "--pf-accent": p.accent,

    // Derived tints used for hovers, chips and soft fills.
    "--pf-primary-soft": withAlpha(p.primary, isDark ? 0.16 : 0.1),
    "--pf-primary-softer": withAlpha(p.primary, isDark ? 0.09 : 0.06),
    "--pf-primary-hover": shade(p.primary, isDark ? 0.12 : -0.12),
    "--pf-accent-soft": withAlpha(p.accent, isDark ? 0.18 : 0.12),
    "--pf-text-soft": withAlpha(p.text, 0.72),
    "--pf-border-soft": withAlpha(p.text, isDark ? 0.08 : 0.07),
    "--pf-overlay": withAlpha(isDark ? "#000000" : "#0b0b0f", 0.55),

    "--pf-font-heading": fontStack(theme.headingFont),
    "--pf-font-body": fontStack(theme.bodyFont),
    "--pf-font-mono": fontStack(theme.monoFont),
    "--pf-heading-weight": String(theme.headingWeight),
    "--pf-heading-case": HEADING_CASE[theme.headingCase] ?? "none",
    "--pf-tracking": `${theme.letterSpacing}em`,
    "--pf-leading": String(theme.lineHeight),

    "--pf-text-xs": size(-2),
    "--pf-text-sm": size(-1),
    "--pf-text-base": `${scale.base}px`,
    "--pf-text-lg": size(1),
    "--pf-text-xl": size(2),
    "--pf-text-2xl": size(3),
    "--pf-text-3xl": size(4),
    "--pf-text-4xl": size(5),
    "--pf-text-5xl": size(6),
    "--pf-text-6xl": size(7),

    "--pf-radius": `${theme.radius}px`,
    "--pf-radius-sm": `${Math.max(2, Math.round(theme.radius * 0.55))}px`,
    "--pf-radius-lg": `${Math.round(theme.radius * 1.5)}px`,
    "--pf-radius-pill": "999px",

    "--pf-section-y": `${density.section}px`,
    "--pf-gap": `${density.gap}px`,
    "--pf-container": CONTAINER[theme.container] ?? CONTAINER.normal,

    "--pf-shadow-sm": shadow.sm,
    "--pf-shadow": shadow.md,
    "--pf-shadow-lg": shadow.lg,

    "--pf-grad": gradient,
    "--pf-grad-from": theme.gradient.from,
    "--pf-grad-to": theme.gradient.to,

    "--pf-backdrop": backdropImage(theme),
    "--pf-backdrop-size": backdropSize(theme),
    "--pf-backdrop-opacity": String(theme.backdrop.opacity),

    "--pf-duration": theme.animations ? "320ms" : "0ms",
  };
}

/** The same variables as a CSS declaration block body, for the HTML export. */
export function themeVarsCss(theme: Theme): string {
  return Object.entries(themeVars(theme))
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
}

/** Data attributes the stylesheet branches on for style families. */
export function themeAttrs(theme: Theme): Record<string, string> {
  return {
    "data-pf-mode": theme.mode,
    "data-pf-buttons": theme.buttonStyle,
    "data-pf-cards": theme.cardStyle,
    "data-pf-backdrop": theme.backdrop.pattern,
    "data-pf-animate": theme.animations ? "on" : "off",
  };
}
