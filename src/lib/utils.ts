/** Small helpers shared by the builder and the renderer. */

let counter = 0;

/** Stable-enough unique id. Not cryptographic — ids only need to be unique per doc. */
export function uid(prefix = "id"): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "section"
  );
}

/** Make `slug` unique against `taken` by appending -2, -3, … */
export function uniqueSlug(slug: string, taken: string[]): string {
  if (!taken.includes(slug)) return slug;
  let n = 2;
  while (taken.includes(`${slug}-${n}`)) n += 1;
  return `${slug}-${n}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function move<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice();
  const [item] = next.splice(from, 1);
  if (item === undefined) return list;
  next.splice(clamp(to, 0, next.length), 0, item);
  return next;
}

export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/* ───────────────────────────── Colour helpers ───────────────────────────── */

/** `#rgb` / `#rrggbb` → `{r,g,b}`. Returns black for anything unparseable. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6 || /[^0-9a-f]/i.test(h)) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Relative luminance per WCAG, used to pick readable foregrounds. */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Black or white, whichever reads better on `bg`. */
export function readableOn(bg: string): string {
  return luminance(bg) > 0.45 ? "#0b0b0f" : "#ffffff";
}

/** Blend `hex` toward white (amount > 0) or black (amount < 0), -1…1. */
export function shade(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const target = amount >= 0 ? 255 : 0;
  const t = Math.abs(amount);
  return rgbToHex(
    r + (target - r) * t,
    g + (target - g) * t,
    b + (target - b) * t,
  );
}

/** `#rrggbb` + alpha → `rgba(...)`. */
export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

/* ───────────────────────────── Text helpers ───────────────────────────── */

/** Escape a string for safe interpolation into exported HTML. */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Split a textarea value into trimmed, non-empty lines. */
export function toLines(value: string): string[] {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Split a comma-separated field into trimmed, non-empty tags. */
export function toTags(value: string): string[] {
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Add `https://` to a bare domain so links work from a static export. */
export function normalizeUrl(url: string): string {
  const v = url.trim();
  if (!v) return "";
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(v)) return v;
  return `https://${v}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * What to show for a project whose name is blank.
 *
 * Projects start unnamed, so every place that displays one needs the same
 * stand-in — and it has to stay a display concern: writing it into the document
 * would just recreate the auto-generated name it replaced.
 */
export function projectLabel(name: string): string {
  return name.trim() || "Untitled project";
}

/**
 * Stand-in shown wherever the profile name is still blank.
 *
 * Documents start with no name, so the preview needs something in the hero or
 * the layout reads as broken. Like `projectLabel`, this stays a display concern:
 * writing it into the document would recreate the pre-filled value it replaced,
 * and the user would be back to clearing a field before they can type in it.
 */
export const NAME_PLACEHOLDER = "Your Name";

export function displayName(name: string): string {
  return name.trim() || NAME_PLACEHOLDER;
}

/**
 * Join title parts with an em dash, skipping the blank ones.
 *
 * A blank name would otherwise leave a stray dash at the front of every page
 * title and export filename.
 */
export function joinTitle(...parts: (string | undefined)[]): string {
  return parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" — ");
}
