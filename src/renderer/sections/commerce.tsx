import { clamp, normalizeUrl } from "@/lib/utils";
import { Icon } from "../icons";
import {
  Avatar,
  Btn,
  EmptyHint,
  EntryLink,
  Grid,
  Prose,
  SectionHead,
  type SectionProps,
} from "../primitives";

/* ───────────────────────────── Services ───────────────────────────── */

export function ServicesSection({ section }: SectionProps) {
  const showPrice = section.options.showPrice !== false;
  const showBullets = section.options.showBullets !== false;
  const variant = section.variant;

  if (section.items.length === 0) {
    return (
      <>
        <SectionHead section={section} />
        <EmptyHint label="services" />
      </>
    );
  }

  if (variant === "list") {
    return (
      <>
        <SectionHead section={section} />
        <ol className="pf-numbered">
          {section.items.map((item) => (
            <li className="pf-numbered-item pf-reveal" key={item.id}>
              <div>
                <div className="pf-entry-head">
                  <h3 className="pf-entry-title">{item.title}</h3>
                  {showPrice && item.value ? <span className="pf-entry-period">{item.value}</span> : null}
                </div>
                {item.description ? <p className="pf-entry-desc">{item.description}</p> : null}
                {showBullets && item.bullets?.length ? (
                  <ul className="pf-price-list">
                    {item.bullets.map((bullet, i) => (
                      <li key={i}>
                        <Icon name="Check" size={16} />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <EntryLink item={item} />
              </div>
            </li>
          ))}
        </ol>
      </>
    );
  }

  if (variant === "icons") {
    return (
      <>
        <SectionHead section={section} />
        <Grid columns={section.columns ?? 3}>
          {section.items.map((item) => (
            <div className="pf-reveal" key={item.id} style={{ textAlign: "center" }}>
              <div className="pf-service-icon" style={{ marginInline: "auto" }}>
                <Icon name={item.icon || "Sparkles"} size={22} />
              </div>
              <h3 className="pf-card-title">{item.title}</h3>
              {item.description ? <p className="pf-card-body">{item.description}</p> : null}
              {showPrice && item.value ? (
                <div className="pf-card-sub" style={{ marginTop: "10px" }}>
                  {item.value}
                </div>
              ) : null}
            </div>
          ))}
        </Grid>
      </>
    );
  }

  if (variant === "detailed") {
    return (
      <>
        <SectionHead section={section} />
        <div className="pf-stack">
          {section.items.map((item) => (
            <div className="pf-card pf-reveal" key={item.id} data-featured={item.featured ? "true" : "false"}>
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>
                <div className="pf-service-icon" style={{ marginBottom: 0 }}>
                  <Icon name={item.icon || "Sparkles"} size={22} />
                </div>
                <div style={{ flex: 1, minWidth: "min(260px, 100%)" }}>
                  <h3 className="pf-card-title">{item.title}</h3>
                  {item.description ? <p className="pf-card-body">{item.description}</p> : null}
                  {showBullets && item.bullets?.length ? (
                    <ul className="pf-price-list">
                      {item.bullets.map((bullet, i) => (
                        <li key={i}>
                          <Icon name="Check" size={16} />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                {showPrice && item.value ? <div className="pf-price">{item.value}</div> : null}
              </div>
              <EntryLink item={item} />
            </div>
          ))}
        </div>
      </>
    );
  }

  // cards
  return (
    <>
      <SectionHead section={section} />
      <Grid columns={section.columns ?? 3}>
        {section.items.map((item) => (
          <div className="pf-card pf-reveal" key={item.id} data-featured={item.featured ? "true" : "false"}>
            <div className="pf-service-icon">
              <Icon name={item.icon || "Sparkles"} size={22} />
            </div>
            <h3 className="pf-card-title">{item.title}</h3>
            {item.description ? <p className="pf-card-body">{item.description}</p> : null}
            {showPrice && item.value ? (
              <div className="pf-card-sub" style={{ marginTop: "12px", fontSize: "var(--pf-text-base)" }}>
                {item.value}
              </div>
            ) : null}
            {showBullets && item.bullets?.length ? (
              <ul className="pf-price-list">
                {item.bullets.map((bullet, i) => (
                  <li key={i}>
                    <Icon name="Check" size={16} />
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}
            <EntryLink item={item} />
          </div>
        ))}
      </Grid>
    </>
  );
}

/* ───────────────────────────── Pricing ───────────────────────────── */

export function PricingSection({ section }: SectionProps) {
  const highlight = section.options.highlightFeatured !== false;
  const showCta = section.options.showCta !== false;
  const variant = section.variant;

  if (section.items.length === 0) {
    return (
      <>
        <SectionHead section={section} />
        <EmptyHint label="plans" />
      </>
    );
  }

  if (variant === "simple") {
    return (
      <>
        <SectionHead section={section} />
        <div className="pf-reveal">
          {section.items.map((item) => (
            <div className="pf-compact-row" key={item.id}>
              <div className="pf-price" style={{ fontSize: "var(--pf-text-xl)", margin: 0 }}>
                {item.value}
              </div>
              <div>
                <h3 className="pf-entry-title">{item.title}</h3>
                {item.description ? <p className="pf-entry-desc">{item.description}</p> : null}
                {showCta ? <EntryLink item={item} /> : null}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (variant === "table") {
    return (
      <>
        <SectionHead section={section} />
        <Grid columns={section.items.length > 3 ? 4 : section.items.length}>
          {section.items.map((item) => (
            <div
              className="pf-card pf-pricing-card pf-reveal"
              key={item.id}
              data-featured={highlight && item.featured ? "true" : "false"}
            >
              <div className="pf-skill-group-title">{item.title}</div>
              <div className="pf-price">{item.value}</div>
              {item.bullets?.length ? (
                <ul className="pf-price-list">
                  {item.bullets.map((bullet, i) => (
                    <li key={i}>
                      <Icon name="Check" size={16} />
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
              {showCta && item.url ? (
                <Btn href={item.url} variant={item.featured ? "primary" : "secondary"}>
                  {item.urlLabel || "Choose"}
                </Btn>
              ) : null}
            </div>
          ))}
        </Grid>
      </>
    );
  }

  // cards
  return (
    <>
      <SectionHead section={section} />
      <Grid columns={section.columns ?? 3}>
        {section.items.map((item) => (
          <div
            className="pf-card pf-pricing-card pf-reveal"
            key={item.id}
            data-featured={highlight && item.featured ? "true" : "false"}
          >
            {highlight && item.featured ? (
              <div className="pf-badge" style={{ marginBottom: "14px" }}>
                <Icon name="Star" size={13} />
                Most popular
              </div>
            ) : null}
            <h3 className="pf-card-title">{item.title}</h3>
            <div className="pf-price">{item.value}</div>
            {item.description ? <p className="pf-card-body">{item.description}</p> : null}
            {item.bullets?.length ? (
              <ul className="pf-price-list">
                {item.bullets.map((bullet, i) => (
                  <li key={i}>
                    <Icon name="Check" size={16} />
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}
            {showCta && item.url ? (
              <Btn href={item.url} variant={item.featured ? "primary" : "secondary"}>
                {item.urlLabel || "Choose plan"}
              </Btn>
            ) : null}
          </div>
        ))}
      </Grid>
    </>
  );
}

/* ───────────────────────────── Stats ───────────────────────────── */

export function StatsSection({ section }: SectionProps) {
  const dividers = section.options.showDividers !== false;
  const countUp = section.options.countUp !== false;
  const variant = section.variant;

  if (section.items.length === 0) return null;

  const stats = section.items.map((item) => (
    <div className="pf-stat pf-reveal" key={item.id}>
      <div className="pf-stat-value" data-countup={countUp ? "true" : "false"}>
        {item.value}
      </div>
      <div className="pf-stat-label">{item.title}</div>
      {item.description ? (
        <div className="pf-quote-role" style={{ marginTop: "4px" }}>
          {item.description}
        </div>
      ) : null}
    </div>
  ));

  if (variant === "cards") {
    return (
      <>
        <SectionHead section={section} />
        <Grid columns={section.columns ?? 4}>
          {section.items.map((item) => (
            <div className="pf-card pf-stat pf-reveal" key={item.id}>
              {item.icon ? (
                <div className="pf-highlight-icon" style={{ marginInline: "auto", marginBottom: "12px" }}>
                  <Icon name={item.icon} size={18} />
                </div>
              ) : null}
              <div className="pf-stat-value" data-countup={countUp ? "true" : "false"}>
                {item.value}
              </div>
              <div className="pf-stat-label">{item.title}</div>
            </div>
          ))}
        </Grid>
      </>
    );
  }

  if (variant === "inline") {
    return (
      <>
        <SectionHead section={section} />
        <div className="pf-stats-band pf-reveal">{stats}</div>
      </>
    );
  }

  return (
    <>
      <SectionHead section={section} />
      <div
        className={`pf-grid pf-stats-row ${variant === "big" ? "pf-stats-big" : ""}`.trim()}
        data-dividers={dividers ? "true" : "false"}
        style={{ "--cols": String(section.columns ?? 4) } as React.CSSProperties}
      >
        {stats}
      </div>
    </>
  );
}

/* ───────────────────────────── Testimonials ───────────────────────────── */

export function TestimonialsSection({ section }: SectionProps) {
  const showAvatars = section.options.showAvatars !== false;
  const showQuoteMark = section.options.showQuoteMark !== false;
  const variant = section.variant;

  if (section.items.length === 0) {
    return (
      <>
        <SectionHead section={section} />
        <EmptyHint label="testimonials" />
      </>
    );
  }

  const quote = (item: (typeof section.items)[number], featured = false) => (
    <div className={featured ? "pf-testimonial-featured pf-reveal" : "pf-reveal"} key={item.id}>
      {showQuoteMark ? <div className="pf-quote-mark">&ldquo;</div> : null}
      <p className="pf-quote-text">{item.description}</p>
      {item.title || item.subtitle ? (
        <div className="pf-quote-author">
          {showAvatars ? <Avatar src={item.image} name={item.title ?? ""} shape="circle" /> : null}
          <div>
            {item.title ? <div className="pf-quote-name">{item.title}</div> : null}
            {item.subtitle ? <div className="pf-quote-role">{item.subtitle}</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );

  if (variant === "featured") {
    return (
      <>
        <SectionHead section={section} align="center" />
        <div className="pf-stack" style={{ gap: "calc(var(--pf-gap) * 2)" }}>
          {section.items.map((item) => quote(item, true))}
        </div>
      </>
    );
  }

  if (variant === "wall") {
    return (
      <>
        <SectionHead section={section} />
        <div className="pf-masonry" style={{ "--cols": String(section.columns ?? 3) } as React.CSSProperties}>
          {section.items.map((item) => (
            <div className="pf-card" key={item.id}>
              {quote(item)}
            </div>
          ))}
        </div>
      </>
    );
  }

  if (variant === "minimal") {
    return (
      <>
        <SectionHead section={section} />
        <div className="pf-stack" style={{ gap: "calc(var(--pf-gap) * 1.5)" }}>
          {section.items.map((item) => (
            <blockquote className="pf-quote-block pf-reveal" key={item.id}>
              <p style={{ fontSize: "var(--pf-text-lg)" }}>{item.description}</p>
              {item.title ? (
                <footer className="pf-quote-role" style={{ marginTop: "12px", fontFamily: "var(--pf-font-body)" }}>
                  — {item.title}
                  {item.subtitle ? `, ${item.subtitle}` : ""}
                </footer>
              ) : null}
            </blockquote>
          ))}
        </div>
      </>
    );
  }

  // cards
  return (
    <>
      <SectionHead section={section} />
      <Grid columns={section.columns ?? 2}>
        {section.items.map((item) => (
          <div className="pf-card" key={item.id}>
            {quote(item)}
          </div>
        ))}
      </Grid>
    </>
  );
}

/* ───────────────────────────── FAQ ───────────────────────────── */

export function FaqSection({ section }: SectionProps) {
  const openFirst = section.options.openFirst !== false;
  const variant = section.variant;

  if (section.items.length === 0) {
    return (
      <>
        <SectionHead section={section} />
        <EmptyHint label="questions" />
      </>
    );
  }

  if (variant === "list" || variant === "twoColumn") {
    return (
      <>
        <SectionHead section={section} />
        <Grid columns={variant === "twoColumn" ? 2 : 1}>
          {section.items.map((item) => (
            <div className="pf-reveal" key={item.id}>
              <h3 className="pf-entry-title" style={{ marginBottom: "8px" }}>
                {item.title}
              </h3>
              <p className="pf-entry-desc">{item.description}</p>
            </div>
          ))}
        </Grid>
      </>
    );
  }

  // accordion — toggled by the runtime script injected with the page
  return (
    <>
      <SectionHead section={section} />
      <div className="pf-reveal">
        {section.items.map((item, i) => {
          const open = openFirst && i === 0;
          return (
            <div className="pf-faq-item" data-open={open ? "true" : "false"} data-pf-faq="" key={item.id}>
              <button type="button" className="pf-faq-q" aria-expanded={open}>
                <span>{item.title}</span>
                <span className="pf-faq-icon">
                  <Icon name="Plus" size={20} />
                </span>
              </button>
              <div className="pf-faq-a">{item.description}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ───────────────────────────── Languages ───────────────────────────── */

export function LanguagesSection({ section }: SectionProps) {
  const showLevels = section.options.showLevels !== false;
  const variant = section.variant;

  if (section.items.length === 0) return null;

  if (variant === "chips") {
    return (
      <>
        <SectionHead section={section} />
        <div className="pf-row pf-reveal">
          {section.items.map((item) => (
            <span className="pf-skill-chip" key={item.id}>
              {item.title}
              {item.subtitle ? <span className="pf-skill-pct">{item.subtitle}</span> : null}
            </span>
          ))}
        </div>
      </>
    );
  }

  if (variant === "list") {
    return (
      <>
        <SectionHead section={section} />
        <Grid columns={section.columns ?? 2}>
          {section.items.map((item) => (
            <div className="pf-highlight pf-reveal" key={item.id}>
              <div className="pf-highlight-icon">
                <Icon name="Languages" size={18} />
              </div>
              <div>
                <div className="pf-highlight-value">{item.title}</div>
                {item.subtitle ? <div className="pf-highlight-label">{item.subtitle}</div> : null}
              </div>
            </div>
          ))}
        </Grid>
      </>
    );
  }

  // bars
  return (
    <>
      <SectionHead section={section} />
      <Grid columns={section.columns ?? 2}>
        {section.items.map((item) => (
          <div className="pf-skill-row pf-reveal" key={item.id}>
            <div className="pf-skill-label">
              <span>{item.title}</span>
              {showLevels && item.subtitle ? <span className="pf-skill-pct">{item.subtitle}</span> : null}
            </div>
            <div className="pf-bar">
              <div
                className="pf-bar-fill"
                style={{ "--level": `${clamp(item.level ?? 0, 0, 100)}%` } as React.CSSProperties}
              />
            </div>
          </div>
        ))}
      </Grid>
    </>
  );
}

/* ───────────────────────────── Clients ───────────────────────────── */

export function ClientsSection({ section }: SectionProps) {
  const grayscale = section.options.grayscale !== false;
  const variant = section.variant;

  if (section.items.length === 0) return null;

  const chip = (item: (typeof section.items)[number], key?: string) => {
    const inner = (
      <div className="pf-client" data-grayscale={grayscale ? "true" : "false"}>
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary user URL
          <img src={item.image} alt={item.title ?? ""} loading="lazy" />
        ) : (
          <span>{item.title}</span>
        )}
      </div>
    );
    if (!item.url) return <div key={key ?? item.id}>{inner}</div>;
    return (
      <a key={key ?? item.id} href={normalizeUrl(item.url)} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  };

  if (variant === "marquee") {
    return (
      <>
        <SectionHead section={section} align="center" />
        <div className="pf-marquee">
          <div className="pf-marquee-track">
            {section.items.map((item) => chip(item))}
            {section.items.map((item) => chip(item, `dup-${item.id}`))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SectionHead section={section} align="center" />
      <Grid columns={section.columns ?? 5}>{section.items.map((item) => chip(item))}</Grid>
    </>
  );
}

/* ───────────────────────────── Call to action ───────────────────────────── */

export function CtaSection({ section }: SectionProps) {
  const useGradient = section.options.useGradient !== false;
  const variant = section.variant;

  const buttons =
    section.items.length > 0 ? (
      <div className="pf-row" style={{ justifyContent: variant === "split" ? "flex-end" : "center" }}>
        {section.items.map((item, i) => (
          <Btn key={item.id} href={item.url} icon={item.icon} variant={i === 0 ? "primary" : "secondary"}>
            {item.title || "Button"}
          </Btn>
        ))}
      </div>
    ) : null;

  const copy = (
    <div>
      {section.eyebrow ? <div className="pf-eyebrow">{section.eyebrow}</div> : null}
      <h2 className="pf-title" style={{ fontSize: "var(--pf-text-2xl)" }}>
        {section.title}
      </h2>
      {section.body ? (
        <div style={{ marginTop: "12px" }}>
          <Prose text={section.body} />
        </div>
      ) : null}
    </div>
  );

  if (variant === "split") {
    return (
      <div className="pf-cta pf-cta-split pf-reveal" data-gradient={useGradient ? "true" : "false"}>
        {copy}
        {buttons}
      </div>
    );
  }

  if (variant === "boxed") {
    return (
      <div style={{ maxWidth: "720px", marginInline: "auto" }}>
        <div className="pf-cta pf-reveal" data-gradient={useGradient ? "true" : "false"}>
          {copy}
          <div style={{ marginTop: "26px" }}>{buttons}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pf-cta pf-reveal" data-gradient={useGradient ? "true" : "false"}>
      {copy}
      <div style={{ marginTop: "26px" }}>{buttons}</div>
    </div>
  );
}
