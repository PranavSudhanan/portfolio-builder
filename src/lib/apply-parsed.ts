import type { ParsedResume } from "./import-resume";
import { createSection } from "./sections";
import type { Item, PortfolioDoc, SectionType } from "./types";
import { normalizeUrl, uid } from "./utils";

/**
 * Write parsed résumé data into a document.
 *
 * Applied as a patch rather than a replacement: a field the parser could not
 * find leaves whatever was already there alone, and `fields` lets the review
 * screen apply only the parts the user accepted.
 */

export type ApplyField =
  | "profile"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "awards"
  | "languages"
  | "links";

/** Find a section by type, creating it if the document does not have one yet. */
function ensureSection(doc: PortfolioDoc, type: SectionType) {
  const existing = doc.sections.find((s) => s.type === type);
  if (existing) return existing;
  const section = createSection(type, doc.sections);
  section.items = [];
  doc.sections.push(section);
  return section;
}

/**
 * A URL reduced to the part that decides whether two links are the same.
 *
 * A résumé header writes a site as "leapsurgebi.com" while the profile stores
 * "https://leapsurgebi.com/". Without this the one address is listed twice,
 * once as the website and once as a social link.
 */
function linkKey(url: string): string {
  let value = url.trim().toLowerCase();
  const scheme = value.indexOf("://");
  if (scheme >= 0) value = value.slice(scheme + 3);
  if (value.startsWith("www.")) value = value.slice(4);
  while (value.endsWith("/")) value = value.slice(0, -1);
  return value;
}

/** A social link the document shipped with and nobody has filled in. */
function isPlaceholderSocial(url: string): boolean {
  const value = url.trim().toLowerCase();
  if (!value) return true;
  return value.includes("yourname") || value.includes("username") || value.includes("example.com");
}

/** Guess the platform for a URL so the icon and label come out right. */
function platformFor(url: string): { icon: string; label: string } {
  const value = url.toLowerCase();
  if (value.includes("linkedin")) return { icon: "linkedin", label: "LinkedIn" };
  if (value.includes("github")) return { icon: "github", label: "GitHub" };
  if (value.includes("gitlab")) return { icon: "gitlab", label: "GitLab" };
  if (value.includes("dribbble")) return { icon: "dribbble", label: "Dribbble" };
  if (value.includes("behance")) return { icon: "other", label: "Behance" };
  if (value.includes("x.com") || value.includes("twitter")) return { icon: "x", label: "X" };
  if (value.includes("instagram")) return { icon: "instagram", label: "Instagram" };
  if (value.includes("youtube")) return { icon: "youtube", label: "YouTube" };
  if (value.includes("medium")) return { icon: "other", label: "Medium" };
  return { icon: "website", label: "Website" };
}

export function applyParsedResume(doc: PortfolioDoc, parsed: ParsedResume, fields: Set<ApplyField>): void {
  if (fields.has("profile")) {
    if (parsed.name) doc.profile.name = parsed.name;
    if (parsed.headline) doc.profile.headline = parsed.headline;
    if (parsed.email) doc.profile.email = parsed.email;
    if (parsed.phone) doc.profile.phone = parsed.phone;
    if (parsed.location) doc.profile.location = parsed.location;
    if (parsed.website) doc.profile.website = parsed.website;
  }

  if (fields.has("links")) {
    for (const url of parsed.links) {
      const normalized = normalizeUrl(url);
      const key = linkKey(normalized);
      if (doc.socials.some((s) => linkKey(s.url) === key)) continue;

      const platform = platformFor(url);

      /*
       * Only recognised profiles become social links. A résumé header often
       * carries a personal site and an employer's — the first is already shown
       * as the website in the contact details, and the rest are somebody
       * else's domain sitting under a link icon.
       */
      if (platform.icon === "website") continue;

      // A new document ships with placeholder social links. Importing a real
      // profile should fill the matching one in, not sit next to it as a
      // second GitHub entry.
      const placeholder = doc.socials.find((s) => s.icon === platform.icon && isPlaceholderSocial(s.url));
      if (placeholder) {
        placeholder.url = normalized;
        continue;
      }
      doc.socials.push({ id: uid("soc"), label: platform.label, url: normalized, icon: platform.icon });
    }

    /*
     * Whatever is still pointing at yourname or example.com was never filled
     * in. Leaving it means the finished page sends a visitor to an account
     * that does not exist, which is worse than one icon fewer.
     */
    doc.socials = doc.socials.filter((s) => !isPlaceholderSocial(s.url));
  }

  const wantsSummary = fields.has("summary") && Boolean(parsed.summary);
  if (wantsSummary) {
    const about = ensureSection(doc, "about");
    about.body = parsed.summary;
    doc.resume.summary = parsed.summary;
  }

  /*
   * The About section ships with sample highlights — "6+ years across startups
   * and enterprise" and the like. Left beside imported text they read as the
   * claims of whoever uploaded the file, so any import replaces them with the
   * few facts the file actually stated, and drops them when it stated none.
   *
   * This runs for every import, not only one that found a summary: a résumé
   * with no summary section is exactly the case where the invented years of
   * experience used to survive.
   */
  const about = wantsSummary ? ensureSection(doc, "about") : doc.sections.find((s) => s.type === "about");
  if (about && fields.size > 0) {
    about.items = (
      [
        { icon: "MapPin", title: "Based in", description: parsed.location },
        { icon: "Mail", title: "Contact", description: parsed.email },
        { icon: "Globe", title: "Website", description: parsed.website },
      ] as const
    )
      .filter((row) => row.description.trim())
      .map((row) => ({ id: uid("it"), icon: row.icon, title: row.title, description: row.description }));
  }

  const replaceItems = (type: SectionType, items: Item[]) => {
    if (items.length === 0) return;
    const section = ensureSection(doc, type);
    section.items = items.map((item) => ({ ...item, id: uid("it") }));
    section.enabled = true;
  };

  if (fields.has("experience")) replaceItems("experience", parsed.experience);
  if (fields.has("education")) replaceItems("education", parsed.education);
  if (fields.has("projects")) replaceItems("projects", parsed.projects);
  if (fields.has("certifications")) replaceItems("certifications", parsed.certifications);
  if (fields.has("awards")) replaceItems("awards", parsed.awards);

  if (fields.has("languages") && parsed.languages.length > 0) {
    const section = ensureSection(doc, "languages");
    section.items = parsed.languages.map((value) => {
      // "English (Native)" and "Hindi - Fluent" both carry the level inline.
      const match = value.match(/^(.*?)\s*[([-]\s*([^)\]]+)\)?$/);
      return {
        id: uid("it"),
        title: (match?.[1] ?? value).trim(),
        subtitle: match?.[2]?.trim(),
      };
    });
    section.enabled = true;
  }

  if (fields.has("skills") && parsed.skills.length > 0) {
    const section = ensureSection(doc, "skills");
    // Flat, ungrouped: the parser cannot tell which category a skill belongs to,
    // and inventing groupings would be worse than leaving them in one list.
    section.items = parsed.skills.map((skill) => ({ id: uid("it"), title: skill }));
    section.variant = "tags";
    section.enabled = true;
  }

  // Keep the résumé columns in step with any sections that were just created.
  const present = new Set(doc.sections.filter((s) => s.enabled).map((s) => s.type));
  for (const type of ["about", "experience", "education", "projects"] as SectionType[]) {
    if (present.has(type) && !doc.resume.sections.includes(type) && !doc.resume.sidebar.includes(type)) {
      doc.resume.sections.push(type);
    }
  }
  for (const type of ["skills", "certifications", "languages", "awards"] as SectionType[]) {
    if (present.has(type) && !doc.resume.sections.includes(type) && !doc.resume.sidebar.includes(type)) {
      doc.resume.sidebar.push(type);
    }
  }
}

/** A short human summary of what the parser found, for the review screen. */
export function describeParsed(parsed: ParsedResume): { field: ApplyField; label: string; detail: string }[] {
  const rows: { field: ApplyField; label: string; detail: string }[] = [];
  const contact = [parsed.name, parsed.email, parsed.phone, parsed.location].filter(Boolean);
  if (contact.length > 0) rows.push({ field: "profile", label: "Contact details", detail: contact.join(" · ") });
  if (parsed.summary)
    rows.push({ field: "summary", label: "Summary", detail: `${parsed.summary.slice(0, 90)}${parsed.summary.length > 90 ? "…" : ""}` });
  if (parsed.experience.length > 0)
    rows.push({
      field: "experience",
      label: `Experience (${parsed.experience.length})`,
      detail: parsed.experience.map((e) => e.title).filter(Boolean).slice(0, 3).join(" · "),
    });
  if (parsed.education.length > 0)
    rows.push({
      field: "education",
      label: `Education (${parsed.education.length})`,
      detail: parsed.education.map((e) => e.title).filter(Boolean).slice(0, 3).join(" · "),
    });
  if (parsed.skills.length > 0)
    rows.push({ field: "skills", label: `Skills (${parsed.skills.length})`, detail: parsed.skills.slice(0, 8).join(" · ") });
  if (parsed.projects.length > 0)
    rows.push({
      field: "projects",
      label: `Projects (${parsed.projects.length})`,
      detail: parsed.projects.map((e) => e.title).filter(Boolean).slice(0, 3).join(" · "),
    });
  if (parsed.certifications.length > 0)
    rows.push({
      field: "certifications",
      label: `Certifications (${parsed.certifications.length})`,
      detail: parsed.certifications.map((e) => e.title).filter(Boolean).slice(0, 3).join(" · "),
    });
  if (parsed.awards.length > 0)
    rows.push({
      field: "awards",
      label: `Awards & publications (${parsed.awards.length})`,
      detail: parsed.awards.map((e) => e.title).filter(Boolean).slice(0, 3).join(" · "),
    });
  if (parsed.languages.length > 0)
    rows.push({ field: "languages", label: `Languages (${parsed.languages.length})`, detail: parsed.languages.join(" · ") });
  if (parsed.links.length > 0)
    rows.push({ field: "links", label: `Links (${parsed.links.length})`, detail: parsed.links.slice(0, 3).join(" · ") });
  return rows;
}
