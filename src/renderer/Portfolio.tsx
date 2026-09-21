import { themeAttrs, themeVarsCss } from "@/lib/theme-css";
import { applyThemePreset } from "@/lib/themes";
import type { PortfolioDoc, Section } from "@/lib/types";
import { displayName, initials, normalizeUrl } from "@/lib/utils";
import { Icon, SocialIcon } from "./icons";
import { Avatar } from "./primitives";
import { SectionRenderer } from "./sections";

/**
 * The portfolio renderer.
 *
 * Pure and hook-free by design — the same tree renders the builder's preview
 * iframe, the `/view` page and the HTML export. Anything that needs behaviour
 * (tab switching, the accordion, reveal on scroll, the theme toggle) is driven
 * by `runtime.ts`, which is injected alongside the markup in all three.
 */

export interface PortfolioProps {
  doc: PortfolioDoc;
  /**
   * Disables scroll-triggered reveals so nothing is stuck invisible inside the
   * builder canvas, where the visitor never scrolls the document itself.
   */
  staticMode?: boolean;
  /** Which tab/panel starts open in the tabbed template. */
  activeAnchor?: string;
  /** Marks a section as selected in the builder canvas. */
  highlightAnchor?: string;
}

function navLabel(section: Section): string {
  return section.title || section.anchor;
}

/* ───────────────────────────── Chrome ───────────────────────────── */

function Logo({ doc }: { doc: PortfolioDoc }) {
  const text = doc.nav.logo || displayName(doc.profile.name);
  return (
    <a className="pf-logo" href="#top">
      <span className="pf-logo-mark">{initials(doc.nav.logo || displayName(doc.profile.name)) || "P"}</span>
      {doc.nav.showName ? <span>{text}</span> : null}
    </a>
  );
}

function TopNav({ doc, sections, active }: { doc: PortfolioDoc; sections: Section[]; active?: string }) {
  return (
    <nav className="pf-nav" data-sticky={doc.nav.sticky ? "true" : "false"}>
      <div className="pf-container">
        <div className="pf-nav-inner">
          <Logo doc={doc} />
          <div className="pf-nav-links" data-pf-navlinks="">
            {sections.map((section) => (
              <a
                key={section.id}
                className="pf-nav-link"
                href={`#${section.anchor}`}
                data-active={active === section.anchor ? "true" : "false"}
                data-pf-navlink={section.anchor}
              >
                {navLabel(section)}
              </a>
            ))}
            {doc.nav.ctaLabel ? (
              <a className="pf-btn" href={normalizeUrl(doc.nav.ctaUrl || "#contact")} style={{ marginLeft: "10px" }}>
                {doc.nav.ctaLabel}
              </a>
            ) : null}
          </div>
          <button type="button" className="pf-nav-toggle" aria-label="Toggle navigation" data-pf-navtoggle="">
            <Icon name="LayoutGrid" size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}

function MinimalNav({ sections, active }: { sections: Section[]; active?: string }) {
  if (sections.length === 0) return null;
  return (
    <nav className="pf-nav-minimal">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.anchor}`}
          data-active={active === section.anchor ? "true" : "false"}
          data-pf-navlink={section.anchor}
        >
          {navLabel(section)}
        </a>
      ))}
    </nav>
  );
}

function SideRail({ doc, sections, active }: { doc: PortfolioDoc; sections: Section[]; active?: string }) {
  const { profile, socials } = doc;
  return (
    <aside className="pf-side">
      <div className="pf-side-id">
        <Avatar src={profile.avatar} name={displayName(profile.name)} shape="circle" className="pf-side-avatar" />
        <h2 className="pf-entry-title" style={{ marginTop: "16px" }}>
          {displayName(profile.name)}
        </h2>
        {profile.headline ? <div className="pf-card-sub">{profile.headline}</div> : null}
        {profile.availability ? (
          <div className="pf-badge" style={{ marginTop: "14px" }}>
            <span className="pf-badge-dot" />
            {profile.availability}
          </div>
        ) : null}
      </div>

      <nav className="pf-side-links">
        {sections.map((section) => (
          <a
            key={section.id}
            className="pf-side-link"
            href={`#${section.anchor}`}
            data-active={active === section.anchor ? "true" : "false"}
            data-pf-navlink={section.anchor}
          >
            {navLabel(section)}
          </a>
        ))}
      </nav>

      <div className="pf-side-foot" style={{ marginTop: "auto" }}>
        {profile.email ? (
          <a className="pf-btn" href={`mailto:${profile.email}`} style={{ width: "100%", marginBottom: "14px" }}>
            <Icon name="Mail" size={16} />
            Get in touch
          </a>
        ) : null}
        {socials.length > 0 ? (
          <div className="pf-socials">
            {socials.map((social) => (
              <a
                key={social.id}
                className="pf-social"
                href={normalizeUrl(social.url)}
                aria-label={social.label}
                title={social.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <SocialIcon platform={social.icon} />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function Dock({ sections, active }: { sections: Section[]; active?: string }) {
  if (sections.length === 0) return null;
  return (
    <nav className="pf-dock">
      {sections.map((section) => (
        <a
          key={section.id}
          className="pf-dock-dot"
          href={`#${section.anchor}`}
          aria-label={navLabel(section)}
          data-active={active === section.anchor ? "true" : "false"}
          data-pf-navlink={section.anchor}
        >
          <span className="pf-dock-label">{navLabel(section)}</span>
        </a>
      ))}
    </nav>
  );
}

function TabBar({ sections, active }: { sections: Section[]; active: string }) {
  return (
    <div className="pf-container" style={{ paddingTop: "24px" }}>
      <div className="pf-tabs" role="tablist">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className="pf-tab"
            role="tab"
            aria-selected={active === section.anchor}
            data-active={active === section.anchor ? "true" : "false"}
            data-pf-tab={section.anchor}
          >
            {navLabel(section)}
          </button>
        ))}
      </div>
    </div>
  );
}

function Footer({ doc }: { doc: PortfolioDoc }) {
  const year = new Date().getFullYear();
  return (
    <footer className="pf-footer">
      <div className="pf-container">
        <div className="pf-footer-inner">
          <div>
            <div>{doc.site.footerText || `© ${year} ${displayName(doc.profile.name)}`}</div>
            {doc.site.showBranding ? (
              <div className="pf-branding">
                Built with <a href="https://github.com/">Portfolio Builder</a>
              </div>
            ) : null}
          </div>
          {doc.socials.length > 0 ? (
            <div className="pf-socials">
              {doc.socials.map((social) => (
                <a
                  key={social.id}
                  className="pf-social"
                  href={normalizeUrl(social.url)}
                  aria-label={social.label}
                  title={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SocialIcon platform={social.icon} />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────────────── Sections ───────────────────────────── */

function SectionBlock({
  section,
  doc,
  index,
  highlighted,
}: {
  section: Section;
  doc: PortfolioDoc;
  index: number;
  highlighted: boolean;
}) {
  return (
    <section
      id={section.anchor}
      className="pf-section"
      data-first={index === 0 ? "true" : "false"}
      data-pf-section={section.anchor}
      data-selected={highlighted ? "true" : "false"}
    >
      <div className="pf-container">
        <SectionRenderer section={section} doc={doc} index={index} />
      </div>
    </section>
  );
}

/* ───────────────────────────── Root ───────────────────────────── */

export function Portfolio({ doc, staticMode = false, activeAnchor, highlightAnchor }: PortfolioProps) {
  const sections = doc.sections.filter((s) => s.enabled);
  const navSections = sections.filter((s) => s.inNav);
  const attrs = themeAttrs(doc.theme);
  const template = doc.template;
  const navStyle = doc.nav.style;

  const active = activeAnchor ?? sections[0]?.anchor ?? "";

  const body =
    template === "tabbed" ? (
      <main id="top">
        {sections.map((section, i) => (
          <div
            className="pf-panel"
            key={section.id}
            data-pf-panel={section.anchor}
            hidden={section.anchor !== active}
          >
            <SectionBlock
              section={section}
              doc={doc}
              index={i}
              highlighted={highlightAnchor === section.anchor}
            />
          </div>
        ))}
      </main>
    ) : (
      <main id="top">
        {sections.map((section, i) => (
          <SectionBlock
            key={section.id}
            section={section}
            doc={doc}
            index={i}
            highlighted={highlightAnchor === section.anchor}
          />
        ))}
      </main>
    );

  const nav = (() => {
    switch (navStyle) {
      case "top":
        return <TopNav doc={doc} sections={navSections} active={highlightAnchor} />;
      case "minimal":
        return <MinimalNav sections={navSections} active={highlightAnchor} />;
      case "dock":
        return <Dock sections={navSections} active={highlightAnchor ?? active} />;
      case "tabs":
        return null; // rendered as a tab bar below
      case "side":
        return null; // rendered as a rail in the sidebar layout
      default:
        return null;
    }
  })();

  const content = (() => {
    if (template === "sidebar" || (navStyle === "side" && template !== "timeline")) {
      return (
        <div className="pf-layout-sidebar">
          <SideRail doc={doc} sections={navSections} active={highlightAnchor ?? active} />
          {body}
        </div>
      );
    }

    if (template === "tabbed" || navStyle === "tabs") {
      return (
        <>
          <TopNav doc={doc} sections={[]} active={highlightAnchor} />
          <TabBar sections={navSections} active={active} />
          {body}
        </>
      );
    }

    if (template === "terminal") {
      return (
        <div className="pf-terminal-window">
          <div className="pf-terminal-bar">
            <span className="pf-terminal-dot" style={{ background: "#ff5f57" }} />
            <span className="pf-terminal-dot" style={{ background: "#febc2e" }} />
            <span className="pf-terminal-dot" style={{ background: "#28c840" }} />
            <span className="pf-terminal-title">
              {doc.profile.name.toLowerCase().replace(/\s+/g, "-") || "portfolio"} — zsh
            </span>
          </div>
          {nav}
          {body}
        </div>
      );
    }

    if (template === "timeline") {
      return (
        <div className="pf-layout-sidebar">
          <SideRail doc={doc} sections={navSections} active={highlightAnchor ?? active} />
          {body}
        </div>
      );
    }

    return (
      <>
        {nav}
        {body}
      </>
    );
  })();

  // Both colour schemes ship up front so the visitor-facing toggle is instant.
  const altTheme = doc.site.themeToggle
    ? applyThemePreset(doc.theme, doc.site.altThemePresetId)
    : null;
  // Theme variables live in a stylesheet rule rather than an inline style. An
  // inline style outranks every selector, which would leave the alternate scheme
  // unable to override it; as a rule, `[data-pf-scheme="alt"]` wins on
  // specificity and the visitor's toggle actually changes something.
  const themeCss = [
    `.pf-root{\n${themeVarsCss(doc.theme)}\n}`,
    altTheme ? `.pf-root[data-pf-scheme="alt"]{\n${themeVarsCss(altTheme)}\n}` : "",
    doc.theme.customCss.trim(),
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <div
      className="pf-root"
      data-pf-template={template}
      data-pf-static={staticMode ? "true" : "false"}
      {...attrs}
    >
      <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      {content}
      <Footer doc={doc} />
      {doc.site.themeToggle ? (
        <button type="button" className="pf-theme-toggle" aria-label="Toggle colour scheme" data-pf-themetoggle="">
          <Icon name={doc.theme.mode === "dark" ? "Sun" : "Moon"} size={19} />
        </button>
      ) : null}
    </div>
  );
}
