import type { Item } from "@/lib/types";
import { clamp } from "@/lib/utils";
import { Icon } from "../icons";
import {
  EmptyHint,
  EntryLink,
  Grid,
  Media,
  Prose,
  SectionHead,
  Tags,
  type SectionProps,
} from "../primitives";

/* ───────────────────────────── Projects ───────────────────────────── */

function ProjectCard({
  item,
  showImages,
  showTags,
  hoverZoom,
}: {
  item: Item;
  showImages: boolean;
  showTags: boolean;
  hoverZoom: boolean;
}) {
  return (
    <article className="pf-card pf-project-card pf-reveal" data-featured={item.featured ? "true" : "false"}>
      {showImages ? <Media src={item.image} alt={item.title} zoom={hoverZoom} label={item.title || "Project"} /> : null}
      <div className="pf-project-body">
        <h3 className="pf-card-title">{item.title}</h3>
        {item.subtitle ? <div className="pf-card-sub">{item.subtitle}</div> : null}
        {item.description ? <p className="pf-card-body">{item.description}</p> : null}
        {showTags ? <Tags tags={item.tags} /> : null}
        <EntryLink item={item} />
      </div>
    </article>
  );
}

export function ProjectsSection({ section }: SectionProps) {
  const showImages = section.options.showImages !== false;
  const showTags = section.options.showTags !== false;
  const hoverZoom = section.options.hoverZoom !== false;
  const variant = section.variant;

  if (section.items.length === 0) {
    return (
      <>
        <SectionHead section={section} />
        <EmptyHint label="projects" />
      </>
    );
  }

  if (variant === "showcase") {
    return (
      <>
        <SectionHead section={section} />
        <div className="pf-showcase">
          {section.items.map((item) => (
            <article className="pf-showcase-item pf-reveal" key={item.id}>
              <Media src={item.image} alt={item.title} zoom={hoverZoom} label={item.title || "Project"} />
              <div>
                {item.period ? <div className="pf-eyebrow">{item.period}</div> : null}
                <h3 className="pf-title" style={{ fontSize: "var(--pf-text-2xl)" }}>
                  {item.title}
                </h3>
                {item.subtitle ? (
                  <div className="pf-card-sub" style={{ marginTop: "6px" }}>
                    {item.subtitle}
                  </div>
                ) : null}
                {item.description ? (
                  <p className="pf-entry-desc" style={{ marginTop: "14px" }}>
                    {item.description}
                  </p>
                ) : null}
                {showTags ? <Tags tags={item.tags} /> : null}
                <EntryLink item={item} />
              </div>
            </article>
          ))}
        </div>
      </>
    );
  }

  if (variant === "list" || variant === "minimal") {
    return (
      <>
        <SectionHead section={section} />
        <div className="pf-reveal">
          {section.items.map((item, i) => (
            <div className="pf-project-row" key={item.id}>
              <span className="pf-project-index">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="pf-entry-title">{item.title}</h3>
                {item.subtitle ? <div className="pf-card-sub">{item.subtitle}</div> : null}
                {variant === "list" && item.description ? (
                  <p className="pf-entry-desc" style={{ marginTop: "8px" }}>
                    {item.description}
                  </p>
                ) : null}
                {variant === "list" && showTags ? <Tags tags={item.tags} /> : null}
              </div>
              <EntryLink item={item} />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (variant === "carousel") {
    return (
      <>
        <SectionHead section={section} />
        <div className="pf-carousel">
          {section.items.map((item) => (
            <ProjectCard
              key={item.id}
              item={item}
              showImages={showImages}
              showTags={showTags}
              hoverZoom={hoverZoom}
            />
          ))}
        </div>
      </>
    );
  }

  // grid
  return (
    <>
      <SectionHead section={section} />
      <Grid columns={section.columns ?? 2}>
        {section.items.map((item) => (
          <ProjectCard
            key={item.id}
            item={item}
            showImages={showImages}
            showTags={showTags}
            hoverZoom={hoverZoom}
          />
        ))}
      </Grid>
    </>
  );
}

/* ───────────────────────────── Skills ───────────────────────────── */

/** Skill sections may be flat or grouped; flatten for the ungrouped variants. */
function flattenSkills(items: Item[]): Item[] {
  return items.flatMap((item) => (item.items?.length ? item.items : [item]));
}

function SkillBar({ item, showLevel }: { item: Item; showLevel: boolean }) {
  const level = clamp(item.level ?? 0, 0, 100);
  return (
    <div className="pf-skill-row">
      <div className="pf-skill-label">
        <span>{item.title}</span>
        {showLevel ? <span className="pf-skill-pct">{level}%</span> : null}
      </div>
      <div className="pf-bar">
        <div className="pf-bar-fill" style={{ "--level": `${level}%` } as React.CSSProperties} />
      </div>
    </div>
  );
}

export function SkillsSection({ section }: SectionProps) {
  const showLevels = section.options.showLevels !== false;
  const showIcons = section.options.showIcons !== false;
  const variant = section.variant;
  const grouped = section.items.some((item) => item.items?.length);

  if (section.items.length === 0) {
    return (
      <>
        <SectionHead section={section} />
        <EmptyHint label="skills" />
      </>
    );
  }

  if (variant === "grouped" && grouped) {
    return (
      <>
        <SectionHead section={section} />
        <Grid columns={section.columns ?? 3}>
          {section.items.map((group) => (
            <div className="pf-reveal" key={group.id}>
              <div className="pf-skill-group-title">{group.title}</div>
              {showLevels ? (
                (group.items ?? []).map((skill) => (
                  <SkillBar key={skill.id} item={skill} showLevel={showLevels} />
                ))
              ) : (
                <ul className="pf-skill-list">
                  {(group.items ?? []).map((skill) => (
                    <li key={skill.id}>{skill.title}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Grid>
      </>
    );
  }

  const flat = flattenSkills(section.items);

  if (variant === "bars") {
    return (
      <>
        <SectionHead section={section} />
        <Grid columns={section.columns ?? 2}>
          {flat.map((skill) => (
            <div className="pf-reveal" key={skill.id}>
              <SkillBar item={skill} showLevel={showLevels} />
            </div>
          ))}
        </Grid>
      </>
    );
  }

  if (variant === "rings") {
    return (
      <>
        <SectionHead section={section} />
        <Grid columns={section.columns ?? 4}>
          {flat.map((skill) => (
            <div className="pf-ring pf-reveal" key={skill.id}>
              <div
                className="pf-ring-circle"
                style={{ "--level": `${clamp(skill.level ?? 0, 0, 100)}%` } as React.CSSProperties}
              >
                <span className="pf-ring-value">{clamp(skill.level ?? 0, 0, 100)}%</span>
              </div>
              <div style={{ fontSize: "var(--pf-text-sm)", fontWeight: 500 }}>{skill.title}</div>
              {skill.subtitle ? <div className="pf-quote-role">{skill.subtitle}</div> : null}
            </div>
          ))}
        </Grid>
      </>
    );
  }

  if (variant === "cards") {
    return (
      <>
        <SectionHead section={section} />
        <Grid columns={section.columns ?? 3}>
          {flat.map((skill) => (
            <div className="pf-card pf-reveal" key={skill.id}>
              {showIcons && skill.icon ? (
                <div className="pf-highlight-icon" style={{ marginBottom: "12px" }}>
                  <Icon name={skill.icon} size={18} />
                </div>
              ) : null}
              <h3 className="pf-card-title" style={{ fontSize: "var(--pf-text-base)" }}>
                {skill.title}
              </h3>
              {skill.subtitle ? <div className="pf-card-body">{skill.subtitle}</div> : null}
              {showLevels && skill.level != null ? (
                <div style={{ marginTop: "14px" }}>
                  <div className="pf-bar">
                    <div
                      className="pf-bar-fill"
                      style={{ "--level": `${clamp(skill.level, 0, 100)}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </Grid>
      </>
    );
  }

  if (variant === "marquee") {
    // The track is duplicated so the CSS animation can loop seamlessly.
    const chips = flat.map((skill) => (
      <span className="pf-skill-chip" key={skill.id}>
        {showIcons && skill.icon ? <Icon name={skill.icon} size={15} /> : null}
        {skill.title}
      </span>
    ));
    return (
      <>
        <SectionHead section={section} />
        <div className="pf-marquee">
          <div className="pf-marquee-track">
            {chips}
            {flat.map((skill) => (
              <span className="pf-skill-chip" key={`dup-${skill.id}`} aria-hidden="true">
                {showIcons && skill.icon ? <Icon name={skill.icon} size={15} /> : null}
                {skill.title}
              </span>
            ))}
          </div>
        </div>
      </>
    );
  }

  // tags
  return (
    <>
      <SectionHead section={section} />
      <div className="pf-row pf-reveal">
        {flat.map((skill) => (
          <span className="pf-skill-chip" key={skill.id}>
            {showIcons && skill.icon ? <Icon name={skill.icon} size={15} /> : null}
            {skill.title}
            {showLevels && skill.level != null ? <span className="pf-skill-pct">{skill.level}%</span> : null}
          </span>
        ))}
      </div>
    </>
  );
}

/* ───────────────────────────── Gallery ───────────────────────────── */

export function GallerySection({ section }: SectionProps) {
  const showCaptions = section.options.showCaptions !== false;
  const rounded = section.options.rounded !== false;
  const grayscale = section.options.grayscale === true;
  const variant = section.variant;

  if (section.items.length === 0) {
    return (
      <>
        <SectionHead section={section} />
        <EmptyHint label="images" />
      </>
    );
  }

  // Varied placeholder heights keep the masonry layout believable before real
  // images are added.
  const ratios = ["4 / 3", "3 / 4", "1 / 1", "16 / 10", "4 / 5", "3 / 2"];

  const tiles = section.items.map((item, i) => {
    const tile = (
      <figure
        className="pf-gallery-item pf-reveal"
        data-rounded={rounded ? "true" : "false"}
        data-grayscale={grayscale ? "true" : "false"}
        key={item.id}
      >
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary user URL
          <img src={item.image} alt={item.title ?? ""} loading="lazy" />
        ) : (
          <div
            className="pf-gallery-placeholder"
            style={{ "--ratio": variant === "grid" ? "1 / 1" : ratios[i % ratios.length] } as React.CSSProperties}
          >
            {item.title || `Image ${i + 1}`}
          </div>
        )}
        {showCaptions && (item.title || item.description) ? (
          <figcaption className="pf-gallery-caption">
            {item.title ? <strong>{item.title}</strong> : null}
            {item.description ? <span>{item.description}</span> : null}
          </figcaption>
        ) : null}
      </figure>
    );

    if (!item.url) return tile;
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer" key={item.id} style={{ display: "block" }}>
        {tile}
      </a>
    );
  });

  if (variant === "masonry") {
    return (
      <>
        <SectionHead section={section} />
        <div className="pf-masonry" style={{ "--cols": String(section.columns ?? 3) } as React.CSSProperties}>
          {tiles}
        </div>
      </>
    );
  }

  if (variant === "strip") {
    return (
      <>
        <SectionHead section={section} />
        <div className="pf-strip">{tiles}</div>
      </>
    );
  }

  if (variant === "fullbleed") {
    return (
      <>
        <SectionHead section={section} />
        <div className="pf-stack">{tiles}</div>
      </>
    );
  }

  // grid
  return (
    <>
      <SectionHead section={section} />
      <Grid columns={section.columns ?? 3}>{tiles}</Grid>
    </>
  );
}

/* ───────────────────────────── Writing ───────────────────────────── */

export function BlogSection({ section }: SectionProps) {
  const showDates = section.options.showDates !== false;
  const showImages = section.options.showImages === true;
  const variant = section.variant;

  if (section.items.length === 0) {
    return (
      <>
        <SectionHead section={section} />
        <EmptyHint label="posts" />
      </>
    );
  }

  if (variant === "cards") {
    return (
      <>
        <SectionHead section={section} />
        <Grid columns={section.columns ?? 2}>
          {section.items.map((item) => (
            <article className="pf-card pf-project-card pf-reveal" key={item.id}>
              {showImages ? <Media src={item.image} alt={item.title} label="Cover" /> : null}
              <div className="pf-project-body">
                {showDates && item.period ? <div className="pf-eyebrow">{item.period}</div> : null}
                <h3 className="pf-card-title">{item.title}</h3>
                {item.description ? <p className="pf-card-body">{item.description}</p> : null}
                <Tags tags={item.tags} />
                <EntryLink item={item} />
              </div>
            </article>
          ))}
        </Grid>
      </>
    );
  }

  return (
    <>
      <SectionHead section={section} />
      <div className="pf-reveal">
        {section.items.map((item) => (
          <div className="pf-project-row" key={item.id}>
            {showDates ? <span className="pf-project-index">{item.period}</span> : <span />}
            <div>
              <h3 className="pf-entry-title">{item.title}</h3>
              {variant === "list" && item.description ? (
                <p className="pf-entry-desc" style={{ marginTop: "6px" }}>
                  {item.description}
                </p>
              ) : null}
            </div>
            <EntryLink item={item} />
          </div>
        ))}
      </div>
    </>
  );
}

/* ───────────────────────────── Custom ───────────────────────────── */

export function CustomSection({ section }: SectionProps) {
  const variant = section.variant;

  if (variant === "embed") {
    const url = String(section.options.embedUrl ?? "");
    const height = Number(section.options.embedHeight ?? 420);
    return (
      <>
        <SectionHead section={section} />
        {url ? (
          <iframe
            className="pf-embed"
            src={url}
            height={height}
            title={section.title || "Embedded content"}
            loading="lazy"
            allowFullScreen
          />
        ) : (
          <div className="pf-media-empty" style={{ position: "static", height: `${height}px`, borderRadius: "var(--pf-radius)" }}>
            Add an embed URL in the section options
          </div>
        )}
      </>
    );
  }

  if (variant === "cards" && section.items.length > 0) {
    return (
      <>
        <SectionHead section={section} />
        <Prose text={section.body} />
        <div style={{ marginTop: section.body ? "28px" : 0 }}>
          <Grid columns={section.columns ?? 2}>
            {section.items.map((item) => (
              <div className="pf-card pf-reveal" key={item.id}>
                {item.icon ? (
                  <div className="pf-highlight-icon" style={{ marginBottom: "12px" }}>
                    <Icon name={item.icon} size={18} />
                  </div>
                ) : null}
                <h3 className="pf-card-title">{item.title}</h3>
                {item.description ? <p className="pf-card-body">{item.description}</p> : null}
                <EntryLink item={item} />
              </div>
            ))}
          </Grid>
        </div>
      </>
    );
  }

  if (variant === "list" && section.items.length > 0) {
    return (
      <>
        <SectionHead section={section} />
        <Prose text={section.body} />
        <ol className="pf-numbered" style={{ marginTop: section.body ? "24px" : 0 }}>
          {section.items.map((item) => (
            <li className="pf-numbered-item pf-reveal" key={item.id}>
              <div>
                <h3 className="pf-entry-title">{item.title}</h3>
                {item.description ? <p className="pf-entry-desc">{item.description}</p> : null}
                <EntryLink item={item} />
              </div>
            </li>
          ))}
        </ol>
      </>
    );
  }

  return (
    <>
      <SectionHead section={section} />
      <div className="pf-reveal">
        <Prose text={section.body} />
      </div>
    </>
  );
}
