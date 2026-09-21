import { normalizeUrl } from "@/lib/utils";
import { Icon, SocialIcon } from "../icons";
import { Grid, Prose, SectionHead, type SectionProps } from "../primitives";

/** One row in the contact details list. */
function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
}) {
  const body = (
    <>
      <div className="pf-contact-icon">
        <Icon name={icon} size={17} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="pf-contact-label">{label}</div>
        <div className="pf-contact-value">{value}</div>
      </div>
    </>
  );
  if (!href) return <div className="pf-contact-item">{body}</div>;
  return (
    <a className="pf-contact-item" href={href}>
      {body}
    </a>
  );
}

function ContactForm({ action, email }: { action: string; email: string }) {
  // With no endpoint configured the form falls back to a mailto: submission,
  // which every browser can handle without a backend.
  const method = action ? "POST" : "GET";
  const target = action || (email ? `mailto:${email}` : "");
  return (
    <form className="pf-form" action={target} method={method} data-pf-form="">
      <div className="pf-field">
        <label htmlFor="pf-name">Name</label>
        <input id="pf-name" name="name" type="text" required placeholder="Your name" />
      </div>
      <div className="pf-field">
        <label htmlFor="pf-email">Email</label>
        <input id="pf-email" name="email" type="email" required placeholder="you@example.com" />
      </div>
      <div className="pf-field">
        <label htmlFor="pf-message">Message</label>
        <textarea id="pf-message" name="message" required placeholder="Tell me about your project…" />
      </div>
      <button type="submit" className="pf-btn">
        Send message
        <Icon name="ArrowRight" size={16} />
      </button>
    </form>
  );
}

export function ContactSection({ section, doc }: SectionProps) {
  const { profile, socials } = doc;
  // A form with neither an endpoint nor an email address has nowhere to submit
  // to, and would silently reload the page instead. Better to show the contact
  // details alone until one of the two is filled in.
  const formAction = String(section.options.formAction ?? "");
  const showForm = section.options.showForm !== false && Boolean(formAction.trim() || profile.email.trim());
  const showSocials = section.options.showSocials !== false && socials.length > 0;
  const variant = section.variant;

  const details = (
    <div className="pf-contact-list">
      {profile.email ? (
        <ContactRow icon="Mail" label="Email" value={profile.email} href={`mailto:${profile.email}`} />
      ) : null}
      {profile.phone ? (
        <ContactRow icon="Phone" label="Phone" value={profile.phone} href={`tel:${profile.phone.replace(/\s/g, "")}`} />
      ) : null}
      {profile.location ? <ContactRow icon="MapPin" label="Location" value={profile.location} /> : null}
      {profile.website ? (
        <ContactRow
          icon="Globe"
          label="Website"
          value={profile.website.replace(/^https?:\/\//, "")}
          href={normalizeUrl(profile.website)}
        />
      ) : null}
      {section.items.map((item) => (
        <ContactRow
          key={item.id}
          icon={item.icon || "Link2"}
          label={item.title || "Link"}
          value={item.description || item.url || ""}
          href={item.url ? normalizeUrl(item.url) : undefined}
        />
      ))}
    </div>
  );

  const socialRow = showSocials ? (
    <div className="pf-socials">
      {socials.map((social) => (
        <a
          key={social.id}
          className="pf-social"
          data-labelled="true"
          href={normalizeUrl(social.url)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <SocialIcon platform={social.icon} />
          {social.label}
        </a>
      ))}
    </div>
  ) : null;

  if (variant === "minimal") {
    return (
      <>
        <SectionHead section={section} align="center" />
        <div className="pf-contact-centered pf-reveal">
          <Prose text={section.body} />
          {profile.email ? (
            <div style={{ marginBlock: "26px" }}>
              <a className="pf-mailto" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </div>
          ) : null}
          <div style={{ display: "flex", justifyContent: "center" }}>{socialRow}</div>
        </div>
      </>
    );
  }

  if (variant === "centered") {
    return (
      <>
        <SectionHead section={section} align="center" />
        <div className="pf-contact-centered pf-reveal">
          <Prose text={section.body} />
          {profile.email ? (
            <div style={{ marginBlock: "26px" }}>
              <a className="pf-btn" href={`mailto:${profile.email}`}>
                Send me an email
                <Icon name="ArrowUpRight" size={16} />
              </a>
            </div>
          ) : null}
          <div style={{ display: "flex", justifyContent: "center" }}>{socialRow}</div>
        </div>
      </>
    );
  }

  if (variant === "cards") {
    return (
      <>
        <SectionHead section={section} align="center" />
        <Prose text={section.body} className="pf-contact-centered" />
        <div style={{ marginTop: "32px" }}>
          <Grid columns={3}>
            {profile.email ? (
              <a className="pf-card pf-reveal" href={`mailto:${profile.email}`} style={{ textAlign: "center" }}>
                <div className="pf-service-icon" style={{ marginInline: "auto" }}>
                  <Icon name="Mail" size={22} />
                </div>
                <h3 className="pf-card-title">Email</h3>
                <p className="pf-card-body">{profile.email}</p>
              </a>
            ) : null}
            {profile.phone ? (
              <a
                className="pf-card pf-reveal"
                href={`tel:${profile.phone.replace(/\s/g, "")}`}
                style={{ textAlign: "center" }}
              >
                <div className="pf-service-icon" style={{ marginInline: "auto" }}>
                  <Icon name="Phone" size={22} />
                </div>
                <h3 className="pf-card-title">Phone</h3>
                <p className="pf-card-body">{profile.phone}</p>
              </a>
            ) : null}
            {profile.location ? (
              <div className="pf-card pf-reveal" style={{ textAlign: "center" }}>
                <div className="pf-service-icon" style={{ marginInline: "auto" }}>
                  <Icon name="MapPin" size={22} />
                </div>
                <h3 className="pf-card-title">Location</h3>
                <p className="pf-card-body">{profile.location}</p>
              </div>
            ) : null}
            {section.items.map((item) => (
              <a
                key={item.id}
                className="pf-card pf-reveal"
                href={item.url ? normalizeUrl(item.url) : undefined}
                style={{ textAlign: "center" }}
              >
                <div className="pf-service-icon" style={{ marginInline: "auto" }}>
                  <Icon name={item.icon || "Link2"} size={22} />
                </div>
                <h3 className="pf-card-title">{item.title}</h3>
                {item.description ? <p className="pf-card-body">{item.description}</p> : null}
              </a>
            ))}
          </Grid>
        </div>
      </>
    );
  }

  // split — details on the left, form on the right
  return (
    <>
      <SectionHead section={section} />
      <div className="pf-contact-split">
        <div className="pf-reveal">
          <Prose text={section.body} />
          {details}
          {socialRow}
        </div>
        {showForm ? (
          <div className="pf-reveal">
            <ContactForm action={formAction} email={profile.email} />
          </div>
        ) : null}
      </div>
    </>
  );
}
