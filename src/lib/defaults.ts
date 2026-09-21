import { PRESETS_BY_ID } from "./presets";
import { createSection } from "./sections";
import { defaultResume } from "./resume";
import { applyThemePreset, counterpartPreset, defaultTheme } from "./themes";
import { getTemplate } from "./templates";
import { DOC_VERSION, type ContainerWidth, type PortfolioDoc, type ResumeSettings, type Section } from "./types";
import { slugify, uid, uniqueSlug } from "./utils";

const DEFAULT_SOCIALS = [
  { id: uid("soc"), label: "GitHub", url: "https://github.com/yourname", icon: "github" },
  { id: uid("soc"), label: "LinkedIn", url: "https://linkedin.com/in/yourname", icon: "linkedin" },
  { id: uid("soc"), label: "X", url: "https://x.com/yourname", icon: "x" },
];

/**
 * Create a fresh document from a profession preset.
 *
 * The preset decides the template, palette, fonts and which sections exist;
 * every section is still populated with sample copy so the canvas has something
 * to show before the user types a word.
 */
export function createDoc(presetId = "developer", name?: string): PortfolioDoc {
  const preset = PRESETS_BY_ID.get(presetId) ?? PRESETS_BY_ID.get("developer")!;
  const template = getTemplate(preset.template);

  let theme = applyThemePreset(defaultTheme(), preset.themePresetId);
  theme = {
    ...theme,
    ...template.themeHints,
    headingFont: preset.headingFont,
    bodyFont: preset.bodyFont,
  };

  const sections: Section[] = [];
  for (const type of preset.sections) {
    const section = createSection(type, sections, preset.id);
    section.anchor = uniqueSlug(
      slugify(section.title),
      sections.map((s) => s.anchor),
    );
    sections.push(section);
  }

  const now = Date.now();
  return {
    version: DOC_VERSION,
    id: uid("doc"),
    // Deliberately blank. Naming a project is the user's call, and a generated
    // name like "Software Developer portfolio" is one they have to clear before
    // they can type their own. The UI shows a placeholder instead.
    name: name?.trim() ?? "",
    presetId: preset.id,
    template: preset.template,
    profile: {
      name: "",
      headline: preset.profile.headline ?? "Your headline",
      tagline: preset.profile.tagline ?? "A sentence about what you do and who you do it for.",
      avatar: "",
      cover: "",
      location: "",
      email: "",
      phone: "",
      website: "",
      availability: preset.profile.availability ?? "",
      resumeUrl: "",
      pronouns: "",
    },
    socials: DEFAULT_SOCIALS.map((s) => ({ ...s, id: uid("soc") })),
    sections,
    theme,
    nav: {
      style: template.defaultNav,
      sticky: true,
      showName: true,
      logo: "",
      ctaLabel: "Hire me",
      ctaUrl: "#contact",
    },
    site: {
      title: "",
      description: "",
      favicon: "✦",
      language: "en",
      showBranding: true,
      footerText: "",
      themeToggle: true,
      altThemePresetId: counterpartPreset(preset.themePresetId),
      scrollAnimations: true,
    },
    resume: {
      ...defaultResume(theme.palette.primary),
      headingFont: preset.headingFont,
      bodyFont: preset.bodyFont,
      // Only keep the résumé sections this preset actually starts with.
      sections: defaultResume().sections.filter((type) => preset.sections.includes(type)),
      sidebar: defaultResume().sidebar.filter((type) => preset.sections.includes(type)),
    },
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Résumé settings for a document that may predate them.
 *
 * A project saved before the résumé existed has no `resume` block, and falling
 * back to a blank document's would leave every column empty. Instead the default
 * column layout is filtered against the sections this document actually has.
 */
function resumeFor(sections: Section[], raw: Partial<ResumeSettings> | undefined): ResumeSettings {
  const present = new Set(sections.filter((s) => s.enabled).map((s) => s.type));
  const fallback = defaultResume();
  return {
    ...fallback,
    ...(raw ?? {}),
    sections: raw?.sections ?? fallback.sections.filter((type) => present.has(type)),
    sidebar: raw?.sidebar ?? fallback.sidebar.filter((type) => present.has(type)),
  };
}

/**
 * Content used to be laid out in a centred column, which left a third of a
 * wide screen empty. Full width is the default now, and documents saved before
 * the change are moved onto it once — except where the column was the point,
 * which is what the narrow setting means.
 */
function upgradeContainer(raw: Partial<PortfolioDoc>): ContainerWidth {
  const current = raw.theme?.container;
  if (!current) return defaultTheme().container;
  if ((raw.version ?? 0) < 2 && current !== "narrow") return "full";
  return current;
}

/**
 * Coerce an arbitrary parsed object into a valid document.
 *
 * Imported files and older saved projects may be missing fields the current
 * schema expects, so every branch falls back to a default rather than throwing.
 */
export function normalizeDoc(input: unknown): PortfolioDoc {
  const base = createDoc("blank");
  if (!input || typeof input !== "object") return base;
  const raw = input as Partial<PortfolioDoc>;

  const sections = Array.isArray(raw.sections)
    ? raw.sections
        .filter((s): s is Section => Boolean(s) && typeof s === "object" && typeof s.type === "string")
        .map((s, i) => ({
          ...s,
          id: s.id || uid("sec"),
          enabled: s.enabled !== false,
          inNav: s.inNav !== false,
          items: Array.isArray(s.items) ? s.items.map((it) => ({ ...it, id: it?.id || uid("it") })) : [],
          options: s.options && typeof s.options === "object" ? s.options : {},
          anchor: s.anchor || slugify(s.title || `section-${i + 1}`),
          variant: s.variant || "default",
          title: s.title ?? "Section",
        }))
    : base.sections;

  return {
    ...base,
    ...raw,
    version: DOC_VERSION,
    id: raw.id || uid("doc"),
    name: raw.name ?? base.name,
    profile: { ...base.profile, ...(raw.profile ?? {}) },
    theme: {
      ...base.theme,
      ...(raw.theme ?? {}),
      container: upgradeContainer(raw),
      palette: { ...base.theme.palette, ...(raw.theme?.palette ?? {}) },
      gradient: { ...base.theme.gradient, ...(raw.theme?.gradient ?? {}) },
      backdrop: { ...base.theme.backdrop, ...(raw.theme?.backdrop ?? {}) },
    },
    nav: { ...base.nav, ...(raw.nav ?? {}) },
    site: { ...base.site, ...(raw.site ?? {}) },
    resume: resumeFor(sections, raw.resume),
    socials: Array.isArray(raw.socials)
      ? raw.socials.map((s) => ({ ...s, id: s?.id || uid("soc") }))
      : base.socials,
    sections,
    createdAt: raw.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  };
}
