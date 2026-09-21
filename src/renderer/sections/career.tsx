import type { Item } from "@/lib/types";
import { Icon } from "../icons";
import {
  Bullets,
  EmptyHint,
  EntryLink,
  Grid,
  LogoChip,
  SectionHead,
  Tags,
  type SectionProps,
} from "../primitives";

/**
 * Career-style sections — experience, education, publications, certifications
 * and awards. They all render the same "entry" shape (title, organisation,
 * period, description) so they can share layout variants.
 */

interface EntryOptions {
  showLogos?: boolean;
  showBullets?: boolean;
}

function Entry({ item, options = {} }: { item: Item; options?: EntryOptions }) {
  const { showLogos = false, showBullets = true } = options;
  return (
    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
      {showLogos ? <LogoChip src={item.image} name={item.subtitle || item.title} /> : null}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="pf-entry-head">
          <div>
            {item.title ? <h3 className="pf-entry-title">{item.title}</h3> : null}
            {item.subtitle ? <div className="pf-entry-org">{item.subtitle}</div> : null}
          </div>
          {item.period ? <span className="pf-entry-period">{item.period}</span> : null}
        </div>
        {item.location ? (
          <div className="pf-entry-meta">
            <span>
              <Icon name="MapPin" size={14} /> {item.location}
            </span>
          </div>
        ) : null}
        {item.description ? <p className="pf-entry-desc">{item.description}</p> : null}
        {showBullets ? <Bullets bullets={item.bullets} /> : null}
        <Tags tags={item.tags} />
        <EntryLink item={item} />
      </div>
    </div>
  );
}

export function CareerSection({ section }: SectionProps) {
  const options: EntryOptions = {
    showLogos: section.options.showLogos === true,
    showBullets: section.options.showBullets !== false,
  };
  const numbered = section.options.numbered === true;
  const showIcons = section.options.showIcons !== false;
  const variant = section.variant;

  if (section.items.length === 0) {
    return (
      <>
        <SectionHead section={section} />
        <EmptyHint label="entries" />
      </>
    );
  }

  if (variant === "cards" || variant === "badges") {
    return (
      <>
        <SectionHead section={section} />
        <Grid columns={section.columns ?? 3}>
          {section.items.map((item) => (
            <div className="pf-card pf-reveal" key={item.id}>
              {variant === "badges" && showIcons ? (
                <div className="pf-highlight-icon" style={{ marginBottom: "14px" }}>
                  <Icon name={item.icon || "BadgeCheck"} size={18} />
                </div>
              ) : null}
              {item.period ? (
                <div className="pf-eyebrow" style={{ marginBottom: "8px" }}>
                  {item.period}
                </div>
              ) : null}
              <h3 className="pf-card-title">{item.title}</h3>
              {item.subtitle ? <div className="pf-card-sub">{item.subtitle}</div> : null}
              {item.description ? <p className="pf-card-body">{item.description}</p> : null}
              <Tags tags={item.tags} />
              <EntryLink item={item} />
            </div>
          ))}
        </Grid>
      </>
    );
  }

  if (variant === "compact") {
    return (
      <>
        <SectionHead section={section} />
        <div className="pf-reveal">
          {section.items.map((item) => (
            <div className="pf-compact-row" key={item.id}>
              <div className="pf-entry-period" style={{ border: "none", background: "none", padding: 0 }}>
                {item.period}
              </div>
              <div>
                <h3 className="pf-entry-title">{item.title}</h3>
                {item.subtitle ? <div className="pf-entry-org">{item.subtitle}</div> : null}
                {item.description ? <p className="pf-entry-desc">{item.description}</p> : null}
                {options.showBullets ? <Bullets bullets={item.bullets} /> : null}
                <Tags tags={item.tags} />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (variant === "grouped") {
    // Publications grouped by their period label, newest group first.
    const groups = new Map<string, Item[]>();
    for (const item of section.items) {
      const key = item.period || "Undated";
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }
    const sorted = Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
    return (
      <>
        <SectionHead section={section} />
        <div className="pf-stack">
          {sorted.map(([period, items]) => (
            <div className="pf-reveal" key={period}>
              <div className="pf-skill-group-title">{period}</div>
              <div className="pf-stack" style={{ gap: "18px" }}>
                {items.map((item) => (
                  <Entry key={item.id} item={item} options={options} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (variant === "timeline") {
    return (
      <>
        <SectionHead section={section} />
        <div className="pf-timeline">
          {section.items.map((item) => (
            <div className="pf-timeline-item pf-reveal" key={item.id}>
              <Entry item={item} options={options} />
            </div>
          ))}
        </div>
      </>
    );
  }

  // list — also used by publications (optionally numbered) and awards
  return (
    <>
      <SectionHead section={section} />
      {numbered ? (
        <ol className="pf-numbered">
          {section.items.map((item) => (
            <li className="pf-numbered-item pf-reveal" key={item.id}>
              <Entry item={item} options={options} />
            </li>
          ))}
        </ol>
      ) : (
        <div className="pf-stack" style={{ gap: "calc(var(--pf-gap) * 1.2)" }}>
          {section.items.map((item) => (
            <div className="pf-reveal" key={item.id}>
              <Entry
                item={item}
                options={{ ...options, showLogos: options.showLogos || (showIcons && Boolean(item.image)) }}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
