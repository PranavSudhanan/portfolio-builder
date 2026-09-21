import { displayName } from "@/lib/utils";
import { Icon } from "../icons";
import { Btn, Grid, Prose, SectionHead, type SectionProps } from "../primitives";

function Highlight({
  title,
  description,
  icon,
}: {
  title?: string;
  description?: string;
  icon?: string;
}) {
  return (
    <div className="pf-highlight">
      {icon ? (
        <div className="pf-highlight-icon">
          <Icon name={icon} size={18} />
        </div>
      ) : null}
      <div>
        {title ? <div className="pf-highlight-label">{title}</div> : null}
        {description ? <div className="pf-highlight-value">{description}</div> : null}
      </div>
    </div>
  );
}

export function AboutSection({ section, doc }: SectionProps) {
  const dropCap = section.options.dropCap === true;
  const showResume = section.options.showResume !== false && Boolean(doc.profile.resumeUrl);
  const variant = section.variant;

  const resumeButton = showResume ? (
    <div style={{ marginTop: "26px" }}>
      <Btn href={doc.profile.resumeUrl} icon="Download" variant="secondary">
        Download résumé
      </Btn>
    </div>
  ) : null;

  if (variant === "quote") {
    return (
      <>
        <SectionHead section={section} />
        <div className="pf-reveal">
          <blockquote className="pf-quote-block">{section.body}</blockquote>
          {resumeButton}
        </div>
      </>
    );
  }

  if (variant === "cards") {
    return (
      <>
        <SectionHead section={section} />
        <Prose text={section.body} dropCap={dropCap} className="pf-reveal" />
        {section.items.length > 0 ? (
          <div style={{ marginTop: "32px" }}>
            <Grid columns={section.columns ?? 2}>
              {section.items.map((item) => (
                <div className="pf-card pf-reveal" key={item.id}>
                  {item.icon ? (
                    <div className="pf-highlight-icon" style={{ marginBottom: "14px" }}>
                      <Icon name={item.icon} size={18} />
                    </div>
                  ) : null}
                  <h3 className="pf-card-title">{item.title}</h3>
                  {item.description ? <p className="pf-card-body">{item.description}</p> : null}
                </div>
              ))}
            </Grid>
          </div>
        ) : null}
        {resumeButton}
      </>
    );
  }

  if (variant === "withImage") {
    return (
      <>
        <SectionHead section={section} />
        <div className="pf-about-split">
          <div className="pf-reveal">
            <Prose text={section.body} dropCap={dropCap} />
            {resumeButton}
          </div>
          <div className="pf-about-image pf-reveal">
            {doc.profile.cover || doc.profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary user URL
              <img src={doc.profile.cover || doc.profile.avatar} alt={displayName(doc.profile.name)} />
            ) : (
              <div className="pf-media-empty">Add a cover image in Profile</div>
            )}
          </div>
        </div>
      </>
    );
  }

  if (variant === "split") {
    return (
      <>
        <SectionHead section={section} />
        <div className="pf-about-split">
          <div className="pf-reveal">
            <Prose text={section.body} dropCap={dropCap} />
            {resumeButton}
          </div>
          {section.items.length > 0 ? (
            <div className="pf-stack pf-reveal">
              {section.items.map((item) => (
                <Highlight key={item.id} title={item.title} description={item.description} icon={item.icon} />
              ))}
            </div>
          ) : null}
        </div>
      </>
    );
  }

  // prose
  return (
    <>
      <SectionHead section={section} />
      <div className="pf-reveal">
        <Prose text={section.body} dropCap={dropCap} />
        {resumeButton}
      </div>
    </>
  );
}
