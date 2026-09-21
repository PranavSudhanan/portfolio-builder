import { fontStack } from "@/lib/fonts";
import { PAGE_SIZES, getResumeTemplate } from "@/lib/resume";
import type { Item, PortfolioDoc, Section, SectionType } from "@/lib/types";
import { clamp, displayName, normalizeUrl, shade, withAlpha } from "@/lib/utils";
import { Icon } from "./icons";

/**
 * The résumé renderer.
 *
 * Pure and hook-free, exactly like the portfolio renderer, so the same tree
 * serves the builder preview, the print output and the HTML export.
 *
 * It reads `doc.sections` — the same content the portfolio uses — and decides
 * layout from `doc.resume`. Nothing here is résumé-specific content; a job is a
 * job whichever document it appears in.
 */

const DENSITY_GAP: Record<string, number> = { tight: 3, normal: 4, airy: 5.4 };

function sectionsOfType(doc: PortfolioDoc, types: SectionType[]): Section[] {
  // Preserve the order the résumé settings ask for, not the portfolio's.
  return types
    .map((type) => doc.sections.find((s) => s.type === type && s.enabled))
    .filter((s): s is Section => Boolean(s));
}

/** Flatten grouped skills so ungrouped renderings still see every entry. */
function flatten(items: Item[]): Item[] {
  return items.flatMap((item) => (item.items?.length ? item.items : [item]));
}

/* ───────────────────────────── Blocks ───────────────────────────── */

function Heading({ children, rule }: { children: React.ReactNode; rule: boolean }) {
  return (
    <h2 className="rs-heading" data-rule={rule ? "true" : "false"}>
      {children}
    </h2>
  );
}

function Entry({ item, showTags = true }: { item: Item; showTags?: boolean }) {
  const org = [item.subtitle, item.location].filter(Boolean);
  return (
    <div className="rs-entry">
      <div className="rs-entry-top">
        <span className="rs-entry-title">{item.title}</span>
        {item.period ? <span className="rs-entry-period">{item.period}</span> : null}
      </div>
      {org.length > 0 ? (
        <div className="rs-entry-org">
          {org.map((part, i) => (
            <span key={i}>
              {i > 0 ? <span className="rs-sep">· </span> : null}
              {part}
            </span>
          ))}
        </div>
      ) : null}
      {item.description ? <p className="rs-entry-desc">{item.description}</p> : null}
      {item.bullets?.length ? (
        <ul className="rs-bullets">
          {item.bullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      ) : null}
      {showTags && item.tags?.length ? (
        <div className="rs-tags">
          {item.tags.map((tag, i) => (
            <span className="rs-tag" key={i}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {item.url ? (
        <a className="rs-link" href={normalizeUrl(item.url)}>
          {item.url.replace(/^https?:\/\//, "")}
        </a>
      ) : null}
    </div>
  );
}

function SkillsBlock({ section, compact }: { section: Section; compact: boolean }) {
  const grouped = section.items.some((item) => item.items?.length);

  if (grouped) {
    return (
      <>
        {section.items.map((group) => (
          <div className="rs-skill-group" key={group.id}>
            <div className="rs-skill-label">{group.title}</div>
            <div className="rs-skill-values">{(group.items ?? []).map((s) => s.title).join(" · ")}</div>
          </div>
        ))}
      </>
    );
  }

  const flat = flatten(section.items);
  const withLevels = flat.some((s) => typeof s.level === "number");

  // In a narrow sidebar, meters read better than a wrapped comma list.
  if (compact && withLevels) {
    return (
      <>
        {flat.map((skill) => (
          <div className="rs-meter" key={skill.id}>
            <div className="rs-meter-top">
              <span>{skill.title}</span>
            </div>
            <div className="rs-meter-track">
              <div
                className="rs-meter-fill"
                style={{ "--level": `${clamp(skill.level ?? 0, 0, 100)}%` } as React.CSSProperties}
              />
            </div>
          </div>
        ))}
      </>
    );
  }

  return <div className="rs-skill-values">{flat.map((s) => s.title).join(" · ")}</div>;
}

function SectionBlock({
  section,
  doc,
  compact,
}: {
  section: Section;
  doc: PortfolioDoc;
  compact: boolean;
}) {
  const rule = doc.resume.headingRule;
  const title = section.title || section.type;

  if (section.type === "about") {
    const text = (doc.resume.summary || section.body || "").trim();
    if (!text) return null;
    return (
      <section className="rs-section">
        <Heading rule={rule}>{title}</Heading>
        <div className="rs-summary">
          {text
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
      </section>
    );
  }

  if (section.type === "skills") {
    if (section.items.length === 0) return null;
    return (
      <section className="rs-section">
        <Heading rule={rule}>{title}</Heading>
        <SkillsBlock section={section} compact={compact} />
      </section>
    );
  }

  if (section.type === "languages") {
    if (section.items.length === 0) return null;
    return (
      <section className="rs-section">
        <Heading rule={rule}>{title}</Heading>
        {section.items.map((item) => (
          <div className="rs-meter-top" key={item.id}>
            <span>{item.title}</span>
            <span className="rs-entry-period">{item.subtitle}</span>
          </div>
        ))}
      </section>
    );
  }

  if (section.items.length === 0 && !section.body) return null;

  return (
    <section className="rs-section">
      <Heading rule={rule}>{title}</Heading>
      {section.body && section.type === "custom" ? <p className="rs-entry-desc">{section.body}</p> : null}
      {section.items.map((item) => (
        <Entry key={item.id} item={item} showTags={!compact} />
      ))}
    </section>
  );
}

/* ───────────────────────────── Header ───────────────────────────── */

function ContactLine({ doc, stacked }: { doc: PortfolioDoc; stacked: boolean }) {
  const { profile, resume } = doc;
  const entries: { icon: string; value: string; href?: string }[] = [];
  if (profile.email) entries.push({ icon: "Mail", value: profile.email, href: `mailto:${profile.email}` });
  if (profile.phone) entries.push({ icon: "Phone", value: profile.phone, href: `tel:${profile.phone}` });
  if (profile.location) entries.push({ icon: "MapPin", value: profile.location });
  if (profile.website)
    entries.push({
      icon: "Globe",
      value: profile.website.replace(/^https?:\/\//, ""),
      href: normalizeUrl(profile.website),
    });
  for (const social of doc.socials) {
    if (!social.url) continue;
    entries.push({
      icon: "Link2",
      value: social.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      href: normalizeUrl(social.url),
    });
  }
  if (entries.length === 0) return null;

  return (
    <div className={stacked ? "rs-aside-contact" : "rs-contact"}>
      {entries.map((entry, i) => (
        <span key={i}>
          {resume.showIcons ? <Icon name={entry.icon} size={12} /> : null}
          {entry.href ? <a href={entry.href}>{entry.value}</a> : entry.value}
        </span>
      ))}
    </div>
  );
}

/* ───────────────────────────── Root ───────────────────────────── */

export interface ResumeProps {
  doc: PortfolioDoc;
  /** Draw page-break guides. Off for print and exports. */
  guides?: boolean;
}

export function Resume({ doc, guides = false }: ResumeProps) {
  const { resume, profile } = doc;
  const template = getResumeTemplate(resume.template);
  const page = PAGE_SIZES[resume.pageSize] ?? PAGE_SIZES.a4;
  const gap = DENSITY_GAP[resume.density] ?? DENSITY_GAP.normal;

  const mainSections = sectionsOfType(doc, resume.sections);
  const sideSections = template.twoColumn ? sectionsOfType(doc, resume.sidebar) : [];

  const style = {
    "--rs-page-w": `${page.width}mm`,
    "--rs-page-h": `${page.height}mm`,
    "--rs-margin": `${resume.margin}mm`,
    "--rs-gap": `${gap}mm`,
    "--rs-size": `${resume.fontSize}pt`,
    "--rs-leading": String(resume.lineHeight),
    "--rs-font-heading": fontStack(resume.headingFont),
    "--rs-font-body": fontStack(resume.bodyFont),
    "--rs-accent": resume.accent,
    "--rs-heading": "#111318",
    "--rs-text": "#24262e",
    "--rs-muted": "#5b5f6b",
    "--rs-border": "#d8dae1",
    "--rs-tint": withAlpha(resume.accent, 0.08),
    "--rs-accent-dark": shade(resume.accent, -0.25),
    "--rs-heading-case": resume.upperHeadings ? "uppercase" : "none",
    "--rs-heading-tracking": resume.upperHeadings ? "0.09em" : "0",
    "--rs-sidebar-w": template.id === "technical" ? "58mm" : "52mm",
  } as React.CSSProperties;

  const headerAlign =
    template.id === "elegant" ? "center" : template.id === "creative" ? "banner" : "start";

  const header = (
    <header className="rs-header" data-align={headerAlign}>
      {resume.showPhoto && profile.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary user URL or data URI
        <img
          className="rs-photo"
          data-shape={headerAlign === "center" ? "circle" : "square"}
          src={profile.avatar}
          alt={displayName(profile.name)}
        />
      ) : null}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 className="rs-name">{displayName(profile.name)}</h1>
        {profile.headline ? <div className="rs-role">{profile.headline}</div> : null}
        {/* A sidebar carries the contact details when there is one. */}
        {sideSections.length > 0 || template.twoColumn ? null : <ContactLine doc={doc} stacked={false} />}
      </div>
    </header>
  );

  const main = mainSections.map((section) => (
    <SectionBlock key={section.id} section={section} doc={doc} compact={false} />
  ));

  const aside = (
    <aside className="rs-aside">
      <section className="rs-section">
        <Heading rule={false}>Contact</Heading>
        <ContactLine doc={doc} stacked />
      </section>
      {sideSections.map((section) => (
        <SectionBlock key={section.id} section={section} doc={doc} compact />
      ))}
    </aside>
  );

  return (
    <div className="rs-root" style={style} data-rs-template={template.id}>
      <div className="rs-page" data-guides={guides ? "true" : "false"}>
        {header}
        {template.twoColumn ? (
          <div className="rs-columns" data-side={template.id === "creative" ? "right" : "left"}>
            {template.id === "creative" ? (
              <>
                <div>{main}</div>
                {aside}
              </>
            ) : (
              <>
                {aside}
                <div>{main}</div>
              </>
            )}
          </div>
        ) : (
          <div>{main}</div>
        )}
      </div>
    </div>
  );
}
