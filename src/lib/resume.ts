import type { PageSize, ResumeSettings, ResumeTemplateId, SectionType } from "./types";

/**
 * Résumé templates and page setup.
 *
 * The résumé reuses the portfolio's content — same jobs, same skills — and only
 * layers its own layout on top. That is why a template here declares which
 * sections belong in a sidebar rather than carrying any content of its own.
 */

export interface ResumeTemplateDefinition {
  id: ResumeTemplateId;
  label: string;
  description: string;
  /** Two-column templates render `sidebar` sections beside the main column. */
  twoColumn: boolean;
  bestFor: string[];
  /** Style defaults applied when the template is selected. */
  hints: Partial<ResumeSettings>;
}

export const RESUME_TEMPLATES: ResumeTemplateDefinition[] = [
  {
    id: "classic",
    label: "Classic",
    description:
      "One column, ruled section headings, no colour blocks. The safest choice for applicant tracking systems.",
    twoColumn: false,
    bestFor: ["Corporate", "Finance", "Law"],
    hints: { headingFont: "Source Serif 4", bodyFont: "Source Serif 4", headingRule: true, upperHeadings: true },
  },
  {
    id: "modern",
    label: "Modern",
    description: "A tinted sidebar for contact details, skills and languages, with roles in the main column.",
    twoColumn: true,
    bestFor: ["Engineering", "Design", "Product"],
    hints: { headingFont: "Manrope", bodyFont: "Inter", headingRule: false, upperHeadings: true },
  },
  {
    id: "compact",
    label: "Compact",
    description: "Tight spacing and small type to fit a long history onto one page without cutting content.",
    twoColumn: false,
    bestFor: ["Senior roles", "Long histories"],
    hints: {
      headingFont: "Inter",
      bodyFont: "Inter",
      fontSize: 9.5,
      density: "tight",
      margin: 12,
      headingRule: true,
      upperHeadings: true,
    },
  },
  {
    id: "elegant",
    label: "Elegant",
    description: "A centred header with generous whitespace and light rules. Reads as a document, not a form.",
    twoColumn: false,
    bestFor: ["Academia", "Consulting", "Medicine"],
    hints: {
      headingFont: "EB Garamond",
      bodyFont: "EB Garamond",
      fontSize: 11,
      density: "airy",
      headingRule: true,
      upperHeadings: false,
    },
  },
  {
    id: "technical",
    label: "Technical",
    description: "Monospaced headings and a dense skills grid, aimed at engineering reviewers.",
    twoColumn: true,
    bestFor: ["Developers", "Data", "DevOps"],
    hints: { headingFont: "JetBrains Mono", bodyFont: "Inter", fontSize: 9.5, headingRule: false, upperHeadings: true },
  },
  {
    id: "creative",
    label: "Creative",
    description: "An accent band down the header and coloured section markers, while staying readable in print.",
    twoColumn: true,
    bestFor: ["Design", "Marketing", "Media"],
    hints: { headingFont: "Sora", bodyFont: "DM Sans", headingRule: false, upperHeadings: true },
  },
];

export const RESUME_TEMPLATES_BY_ID = new Map(RESUME_TEMPLATES.map((t) => [t.id, t]));

export function getResumeTemplate(id: ResumeTemplateId): ResumeTemplateDefinition {
  return RESUME_TEMPLATES_BY_ID.get(id) ?? RESUME_TEMPLATES[0];
}

/** Page dimensions in millimetres. */
export const PAGE_SIZES: Record<PageSize, { width: number; height: number; label: string }> = {
  a4: { width: 210, height: 297, label: "A4 (210 × 297 mm)" },
  letter: { width: 215.9, height: 279.4, label: "US Letter (8.5 × 11 in)" },
};

/** Section types a résumé can render, in the order they are usually wanted. */
export const RESUME_SECTION_TYPES: SectionType[] = [
  "about",
  "experience",
  "education",
  "projects",
  "skills",
  "certifications",
  "awards",
  "publications",
  "languages",
  "services",
  "custom",
];

/** Sections that belong in a sidebar when the template has one. */
const DEFAULT_SIDEBAR: SectionType[] = ["skills", "certifications", "languages", "awards"];
const DEFAULT_MAIN: SectionType[] = ["about", "experience", "projects", "education", "publications"];

export function defaultResume(accent = "#2563eb"): ResumeSettings {
  return {
    template: "modern",
    pageSize: "a4",
    accent,
    headingFont: "Manrope",
    bodyFont: "Inter",
    fontSize: 10,
    lineHeight: 1.42,
    margin: 16,
    density: "normal",
    showPhoto: false,
    showIcons: true,
    upperHeadings: true,
    headingRule: false,
    sections: [...DEFAULT_MAIN],
    sidebar: [...DEFAULT_SIDEBAR],
    summary: "",
  };
}

/** Apply a template's style defaults, keeping the user's content choices. */
export function applyResumeTemplate(resume: ResumeSettings, id: ResumeTemplateId): ResumeSettings {
  const template = getResumeTemplate(id);
  const next: ResumeSettings = { ...resume, ...template.hints, template: id };

  // Moving to a single column would otherwise strand whatever sat in the
  // sidebar, so fold it back into the main column — and split it out again
  // when moving the other way.
  if (!template.twoColumn && resume.sidebar.length > 0) {
    next.sections = [...next.sections, ...resume.sidebar.filter((s) => !next.sections.includes(s))];
    next.sidebar = [];
  } else if (template.twoColumn && resume.sidebar.length === 0) {
    next.sidebar = DEFAULT_SIDEBAR.filter((s) => next.sections.includes(s));
    next.sections = next.sections.filter((s) => !next.sidebar.includes(s));
  }
  return next;
}
