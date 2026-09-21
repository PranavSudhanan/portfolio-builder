/**
 * The portfolio document schema.
 *
 * A `PortfolioDoc` is the single source of truth for everything the builder
 * edits and everything the renderer draws. It is plain JSON so it can be
 * persisted to localStorage, exported to a file, or embedded in a share link.
 */

export const DOC_VERSION = 2;

/* ────────────────────────────── Primitives ────────────────────────────── */

export type ID = string;

export interface Link {
  id: ID;
  label: string;
  url: string;
  /** Key into the social icon registry (see `lib/icons.ts`). */
  icon?: string;
}

/* ────────────────────────────── Theme ────────────────────────────── */

export type ThemeMode = "light" | "dark";

export interface Palette {
  bg: string;
  surface: string;
  elevated: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  onPrimary: string;
  secondary: string;
  accent: string;
}

export type FontScale = "compact" | "normal" | "comfortable" | "grand";
export type Density = "tight" | "normal" | "airy";
export type ContainerWidth = "narrow" | "normal" | "wide" | "full";
export type ShadowLevel = "none" | "soft" | "medium" | "strong";
export type ButtonStyle = "solid" | "outline" | "ghost" | "gradient" | "soft";
export type CardStyle = "flat" | "bordered" | "elevated" | "glass" | "outline";
export type BackdropPattern =
  | "none"
  | "dots"
  | "grid"
  | "mesh"
  | "noise"
  | "rays"
  | "waves";
export type HeadingCase = "none" | "upper" | "title";

export interface Theme {
  /** Id of the preset this theme was derived from, for UI highlighting. */
  presetId: string;
  mode: ThemeMode;
  palette: Palette;

  headingFont: string;
  bodyFont: string;
  monoFont: string;
  headingWeight: number;
  headingCase: HeadingCase;
  fontScale: FontScale;
  letterSpacing: number;
  lineHeight: number;

  radius: number;
  density: Density;
  container: ContainerWidth;
  shadow: ShadowLevel;
  buttonStyle: ButtonStyle;
  cardStyle: CardStyle;

  /** Decorative accent gradient used by headings, buttons and highlights. */
  gradient: { enabled: boolean; from: string; to: string; angle: number };
  backdrop: { pattern: BackdropPattern; opacity: number };

  animations: boolean;
  /** Extra CSS appended to the portfolio stylesheet verbatim. */
  customCss: string;
}

/* ────────────────────────────── Sections ────────────────────────────── */

export type SectionType =
  | "hero"
  | "about"
  | "experience"
  | "education"
  | "projects"
  | "skills"
  | "services"
  | "gallery"
  | "testimonials"
  | "publications"
  | "certifications"
  | "awards"
  | "stats"
  | "blog"
  | "pricing"
  | "faq"
  | "languages"
  | "clients"
  | "contact"
  | "cta"
  | "custom";

/** A repeated entry inside a section (a job, a project, a photo…). */
export interface Item {
  id: ID;
  title?: string;
  subtitle?: string;
  description?: string;
  /** Free-form period label, e.g. "2021 — Present". */
  period?: string;
  location?: string;
  url?: string;
  urlLabel?: string;
  image?: string;
  icon?: string;
  tags?: string[];
  /** 0–100, used by skills and progress-style items. */
  level?: number;
  /** Bullet list, used by experience and services. */
  bullets?: string[];
  /** Display value for stat and pricing items. */
  value?: string;
  featured?: boolean;
  /** Children, used by grouped sections such as skill categories. */
  items?: Item[];
}

export interface Section {
  id: ID;
  type: SectionType;
  /** Shown in nav/tabs and as the section heading. */
  title: string;
  /** Optional kicker above the heading. */
  eyebrow?: string;
  /** Optional supporting paragraph under the heading. */
  subtitle?: string;
  enabled: boolean;
  /** Slug used for in-page anchors and tab routing. */
  anchor: string;
  /** Whether this section appears in the nav / tab bar. */
  inNav: boolean;
  /** Per-section layout variant — options come from the section registry. */
  variant: string;
  /** Number of columns for grid layouts (1–4). */
  columns?: number;
  /** Long-form body copy for prose-style sections. */
  body?: string;
  items: Item[];
  /** Per-section option bag — keys are declared by the section registry. */
  options: Record<string, string | number | boolean>;
}

/* ────────────────────────────── Résumé ────────────────────────────── */

export type ResumeTemplateId =
  | "classic"
  | "modern"
  | "compact"
  | "elegant"
  | "technical"
  | "creative";

export type PageSize = "a4" | "letter";

/**
 * Résumé settings.
 *
 * The résumé draws from the same `sections` as the portfolio — the same job
 * history, the same skills — but keeps its own order, styling and page setup,
 * because a document that has to fit on two sides of A4 wants different
 * decisions from a web page.
 */
export interface ResumeSettings {
  template: ResumeTemplateId;
  pageSize: PageSize;
  /** Accent colour, independent of the portfolio theme. */
  accent: string;
  headingFont: string;
  bodyFont: string;
  /** Base body size in points. */
  fontSize: number;
  lineHeight: number;
  /** Page margin in millimetres. */
  margin: number;
  density: Density;
  showPhoto: boolean;
  showIcons: boolean;
  upperHeadings: boolean;
  /** Draw a rule under each section heading. */
  headingRule: boolean;
  /** Section types, in order, rendered in the main column. */
  sections: SectionType[];
  /** Section types rendered in the sidebar of two-column templates. */
  sidebar: SectionType[];
  /** Professional summary. Falls back to the About section's body. */
  summary: string;
}

/* ────────────────────────────── Document ────────────────────────────── */

export type NavStyle = "top" | "tabs" | "side" | "dock" | "minimal" | "none";

export type TemplateId =
  | "minimal"
  | "classic"
  | "sidebar"
  | "tabbed"
  | "magazine"
  | "terminal"
  | "canvas"
  | "timeline"
  | "bento"
  | "onepage";

export interface Profile {
  name: string;
  headline: string;
  tagline: string;
  avatar: string;
  cover: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  /** Short availability badge, e.g. "Open to work". Empty hides the badge. */
  availability: string;
  resumeUrl: string;
  pronouns: string;
}

export interface SiteSettings {
  /** Browser tab title. Falls back to "{name} — {headline}". */
  title: string;
  description: string;
  /** Emoji used as the favicon. */
  favicon: string;
  language: string;
  /** Show a "Built with Portfolio Builder" line in the footer. */
  showBranding: boolean;
  footerText: string;
  /** Show a floating theme toggle on the published portfolio. */
  themeToggle: boolean;
  /**
   * Colour preset used when the visitor flips the theme toggle. Both palettes
   * are emitted up front so switching never waits on a recompute.
   */
  altThemePresetId: string;
  /** Reveal-on-scroll behaviour in the published site. */
  scrollAnimations: boolean;
}

export interface NavSettings {
  style: NavStyle;
  sticky: boolean;
  showName: boolean;
  /** Logo text; falls back to the profile name. */
  logo: string;
  ctaLabel: string;
  ctaUrl: string;
}

export interface PortfolioDoc {
  version: number;
  id: ID;
  /** Human name for this project inside the builder dashboard. */
  name: string;
  /** Preset the project was created from, for UI hints. */
  presetId: string;
  template: TemplateId;
  profile: Profile;
  socials: Link[];
  sections: Section[];
  theme: Theme;
  nav: NavSettings;
  site: SiteSettings;
  resume: ResumeSettings;
  createdAt: number;
  updatedAt: number;
}

/* ────────────────────────────── Registry types ────────────────────────────── */

/** Which editor controls a section type exposes beyond the common ones. */
export interface SectionFieldSpec {
  key: string;
  label: string;
  type: "text" | "toggle" | "select" | "number";
  help?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

/** Which fields an `Item` of this section type actually uses. */
export type ItemFieldKey = keyof Omit<Item, "id" | "items">;

export interface SectionDefinition {
  type: SectionType;
  label: string;
  description: string;
  icon: string;
  /** Grouping in the "add section" library. */
  group: "core" | "career" | "work" | "social" | "commerce" | "extra";
  variants: { value: string; label: string }[];
  /** Item fields surfaced in the item editor, in display order. */
  itemFields: ItemFieldKey[];
  /** Label for a single entry, e.g. "Role", "Project". */
  itemLabel: string;
  /** Section supports a long-form body field. */
  hasBody: boolean;
  /** Section supports a column-count control. */
  hasColumns: boolean;
  /** Extra per-section options. */
  options: SectionFieldSpec[];
  /** Whether more than one of these may exist in a document. */
  singleton?: boolean;
  /** Factory for a fresh, populated section. */
  sample: () => Omit<Section, "id" | "anchor">;
}

export interface TemplateDefinition {
  id: TemplateId;
  label: string;
  description: string;
  /** Best-fit professions, shown as chips in the template picker. */
  bestFor: string[];
  /** Nav style this template is designed around. */
  defaultNav: NavStyle;
  /** Theme tweaks applied when the template is selected. */
  themeHints?: Partial<Theme>;
}

export interface ThemePreset {
  id: string;
  name: string;
  mode: ThemeMode;
  palette: Palette;
  gradient: { from: string; to: string };
  /** Short descriptor shown under the swatch. */
  vibe: string;
}

export interface ProfessionPreset {
  id: string;
  label: string;
  icon: string;
  description: string;
  template: TemplateId;
  themePresetId: string;
  headingFont: string;
  bodyFont: string;
  /** Section types, in order, that the preset starts with. */
  sections: SectionType[];
  profile: Partial<Profile>;
}
