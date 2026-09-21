import type { TemplateDefinition, TemplateId } from "./types";

/**
 * Templates control layout and chrome only — never colour.
 *
 * Colour, type and spacing all live in the theme, so any template can be
 * combined with any theme preset. `themeHints` are applied once, at the moment
 * a template is picked, and stay editable afterwards.
 */
export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "minimal",
    label: "Minimal",
    description:
      "A single centred column with generous whitespace. Content first, chrome last.",
    bestFor: ["Writers", "Founders", "Consultants"],
    defaultNav: "minimal",
    themeHints: { container: "narrow", cardStyle: "flat", backdrop: { pattern: "none", opacity: 0.4 } },
  },
  {
    id: "classic",
    label: "Classic",
    description:
      "Sticky top navigation over full-width stacked sections. The safe, familiar choice.",
    bestFor: ["Most professions", "Corporate", "Agencies"],
    defaultNav: "top",
    themeHints: { container: "full", cardStyle: "bordered" },
  },
  {
    id: "sidebar",
    label: "Sidebar",
    description:
      "A fixed profile rail on the left with scrolling content beside it. Keeps contact details always visible.",
    bestFor: ["Developers", "Designers", "Job seekers"],
    defaultNav: "side",
    themeHints: { container: "full", cardStyle: "bordered" },
  },
  {
    id: "tabbed",
    label: "Tabbed",
    description:
      "Each section becomes a tab, shown one at a time. Great when you have a lot of material to organise.",
    bestFor: ["Academics", "Doctors", "Multi-disciplinary"],
    defaultNav: "tabs",
    themeHints: { container: "full", cardStyle: "elevated" },
  },
  {
    id: "magazine",
    label: "Magazine",
    description:
      "Editorial layout with oversized headings, rules between sections and asymmetric grids.",
    bestFor: ["Journalists", "Photographers", "Art directors"],
    defaultNav: "top",
    themeHints: {
      container: "full",
      cardStyle: "flat",
      headingFont: "Playfair Display",
      fontScale: "grand",
    },
  },
  {
    id: "terminal",
    label: "Terminal",
    description:
      "Monospaced, command-line inspired shell with a window chrome and prompt-style headings.",
    bestFor: ["Developers", "Security", "Data engineers"],
    defaultNav: "top",
    themeHints: {
      container: "full",
      cardStyle: "outline",
      headingFont: "JetBrains Mono",
      bodyFont: "IBM Plex Mono",
      radius: 6,
    },
  },
  {
    id: "canvas",
    label: "Canvas",
    description:
      "Image-led layout that puts galleries and project shots at full bleed. Text steps back.",
    bestFor: ["Photographers", "Illustrators", "Architects"],
    defaultNav: "minimal",
    themeHints: { container: "full", cardStyle: "flat", radius: 4 },
  },
  {
    id: "timeline",
    label: "Timeline",
    description:
      "Everything on one chronological spine, with each section as a stop along the way.",
    bestFor: ["Academics", "Career changers", "Researchers"],
    defaultNav: "side",
    themeHints: { container: "full", cardStyle: "bordered" },
  },
  {
    id: "bento",
    label: "Bento",
    description:
      "A grid of cards where featured entries take double width. Dense and scannable.",
    bestFor: ["Product managers", "Marketers", "Generalists"],
    defaultNav: "top",
    themeHints: { container: "full", cardStyle: "elevated", radius: 20 },
  },
  {
    id: "onepage",
    label: "One page",
    description:
      "Full-height sections with a dot navigator down the side. Presentation-like.",
    bestFor: ["Creatives", "Speakers", "Personal brands"],
    defaultNav: "dock",
    themeHints: { container: "full", cardStyle: "glass", backdrop: { pattern: "mesh", opacity: 0.7 } },
  },
];

export const TEMPLATES_BY_ID = new Map(TEMPLATES.map((t) => [t.id, t]));

export function getTemplate(id: TemplateId): TemplateDefinition {
  return TEMPLATES_BY_ID.get(id) ?? TEMPLATES[1];
}
