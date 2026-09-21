import type { ReactNode } from "react";
import type { Item, PortfolioDoc, Section } from "@/lib/types";
import { initials, normalizeUrl } from "@/lib/utils";
import { Icon } from "./icons";

/**
 * Shared building blocks for section renderers.
 *
 * Everything here is a pure, hook-free function of its props. That is a hard
 * requirement: the same components are rendered by React on the client for the
 * live preview and by `renderToStaticMarkup` on the server for the HTML export.
 */

export interface SectionProps {
  section: Section;
  doc: PortfolioDoc;
  index: number;
}

/** Section heading block: eyebrow, title and optional subtitle. */
export function SectionHead({
  section,
  align = "start",
}: {
  section: Section;
  align?: "start" | "center";
}) {
  const hasHeading = Boolean(section.title || section.eyebrow || section.subtitle);
  if (!hasHeading) return null;
  return (
    <div className="pf-head pf-reveal" data-align={align}>
      <div>
        {section.eyebrow ? <div className="pf-eyebrow">{section.eyebrow}</div> : null}
        {section.title ? <h2 className="pf-title">{section.title}</h2> : null}
      </div>
      {section.subtitle ? <p className="pf-subtitle">{section.subtitle}</p> : null}
    </div>
  );
}

/** A link styled as a button, or a plain button when there is no URL. */
export function Btn({
  href,
  children,
  variant = "primary",
  icon,
  external,
}: {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  icon?: string;
  external?: boolean;
}) {
  const url = href ? normalizeUrl(href) : "";
  const content = (
    <>
      {children}
      {icon ? <Icon name={icon} size={16} /> : null}
    </>
  );
  if (!url) {
    return (
      <span className="pf-btn" data-variant={variant}>
        {content}
      </span>
    );
  }
  const isExternal = external ?? /^https?:/i.test(url);
  return (
    <a
      className="pf-btn"
      data-variant={variant}
      href={url}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  );
}

export function Tags({ tags }: { tags?: string[] }) {
  if (!tags?.length) return null;
  return (
    <div className="pf-tags">
      {tags.map((tag, i) => (
        <span className="pf-tag" key={`${tag}-${i}`}>
          {tag}
        </span>
      ))}
    </div>
  );
}

export function Bullets({ bullets }: { bullets?: string[] }) {
  if (!bullets?.length) return null;
  return (
    <ul className="pf-bullets">
      {bullets.map((bullet, i) => (
        <li key={`${i}-${bullet.slice(0, 12)}`}>{bullet}</li>
      ))}
    </ul>
  );
}

/** Multi-paragraph text. Blank lines become paragraph breaks. */
export function Prose({
  text,
  dropCap = false,
  className,
}: {
  text?: string;
  dropCap?: boolean;
  className?: string;
}) {
  if (!text?.trim()) return null;
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className={`pf-prose ${className ?? ""}`.trim()} data-dropcap={dropCap ? "true" : "false"}>
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  );
}

/** Image with a labelled placeholder when no source is set yet. */
export function Media({
  src,
  alt,
  zoom = false,
  ratio,
  label = "No image",
}: {
  src?: string;
  alt?: string;
  zoom?: boolean;
  ratio?: string;
  label?: string;
}) {
  return (
    <div className="pf-media" data-zoom={zoom ? "true" : "false"} style={ratio ? { aspectRatio: ratio } : undefined}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- sources are arbitrary user URLs and data URIs
        <img src={src} alt={alt ?? ""} loading="lazy" />
      ) : (
        <div className="pf-media-empty">{label}</div>
      )}
    </div>
  );
}

export function Avatar({
  src,
  name,
  className,
  shape = "rounded",
}: {
  src?: string;
  name: string;
  className?: string;
  shape?: "rounded" | "circle";
}) {
  return (
    <div className={`pf-avatar ${className ?? ""}`.trim()} data-shape={shape}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- sources are arbitrary user URLs and data URIs
        <img src={src} alt={name} />
      ) : (
        <span>{initials(name) || "?"}</span>
      )}
    </div>
  );
}

/** A company / institution logo chip, falling back to initials. */
export function LogoChip({ src, name }: { src?: string; name?: string }) {
  return (
    <div className="pf-logo-chip">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- sources are arbitrary user URLs and data URIs
        <img src={src} alt={name ?? ""} loading="lazy" />
      ) : (
        <span>{initials(name ?? "") || "—"}</span>
      )}
    </div>
  );
}

/** Link shown at the bottom of a card or entry. */
export function EntryLink({ item }: { item: Item }) {
  if (!item.url) return null;
  const url = normalizeUrl(item.url);
  const isExternal = /^https?:/i.test(url);
  return (
    <a
      className="pf-project-link"
      href={url}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {item.urlLabel || "View"}
      <Icon name={isExternal ? "ArrowUpRight" : "ArrowRight"} size={15} />
    </a>
  );
}

/** Grid wrapper that passes the column count to CSS. */
export function Grid({
  columns = 2,
  children,
  className,
}: {
  columns?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`pf-grid ${className ?? ""}`.trim()}
      style={{ "--cols": String(Math.max(1, Math.min(4, columns))) } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/** Shown in the builder when a section has no entries yet. */
export function EmptyHint({ label }: { label: string }) {
  return (
    <p className="pf-muted" style={{ fontSize: "var(--pf-text-sm)", fontStyle: "italic" }}>
      No {label.toLowerCase()} added yet.
    </p>
  );
}
