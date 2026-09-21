import { displayName, normalizeUrl } from "@/lib/utils";
import { Icon, SocialIcon } from "../icons";
import { Avatar, Btn, type SectionProps } from "../primitives";

/** Contact / location line under the headline. */
function HeroMeta({ location, email, website }: { location?: string; email?: string; website?: string }) {
  if (!location && !email && !website) return null;
  return (
    <div className="pf-hero-meta">
      {location ? (
        <span>
          <Icon name="MapPin" size={15} />
          {location}
        </span>
      ) : null}
      {email ? (
        <span>
          <Icon name="Mail" size={15} />
          <a href={`mailto:${email}`}>{email}</a>
        </span>
      ) : null}
      {website ? (
        <span>
          <Icon name="Globe" size={15} />
          <a href={normalizeUrl(website)} target="_blank" rel="noopener noreferrer">
            {website.replace(/^https?:\/\//, "")}
          </a>
        </span>
      ) : null}
    </div>
  );
}

export function HeroSection({ section, doc }: SectionProps) {
  const { profile, socials } = doc;
  const options = section.options;
  const showAvatar = options.showAvatar !== false;
  const showAvailability = options.showAvailability !== false && Boolean(profile.availability);
  const showSocials = options.showSocials !== false && socials.length > 0;
  const showScrollHint = options.showScrollHint !== false;
  const typewriter = options.typewriter === true;
  const variant = section.variant;

  const copy = (
    <div className="pf-hero-copy pf-reveal">
      {showAvailability ? (
        <div className="pf-badge" style={{ marginBottom: "20px" }}>
          <span className="pf-badge-dot" />
          {profile.availability}
        </div>
      ) : null}

      <h1 className="pf-hero-name">{displayName(profile.name)}</h1>

      {profile.headline ? (
        <p className={`pf-hero-headline ${typewriter ? "pf-caret" : ""}`.trim()}>{profile.headline}</p>
      ) : null}

      {profile.tagline ? <p className="pf-hero-tagline">{profile.tagline}</p> : null}

      {variant === "minimal" || variant === "cover" ? (
        <HeroMeta location={profile.location} email={profile.email} website={profile.website} />
      ) : null}

      {section.items.length > 0 ? (
        <div className="pf-hero-actions">
          {section.items.map((action, i) => (
            <Btn key={action.id} href={action.url} icon={action.icon} variant={i === 0 ? "primary" : "secondary"}>
              {action.title || "Button"}
            </Btn>
          ))}
        </div>
      ) : null}

      {showSocials ? (
        <div className="pf-socials">
          {socials.map((social) => (
            <a
              key={social.id}
              className="pf-social"
              href={normalizeUrl(social.url)}
              title={social.label}
              aria-label={social.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SocialIcon platform={social.icon} />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );

  const avatar = showAvatar ? (
    <Avatar
      src={profile.avatar}
      name={displayName(profile.name)}
      className="pf-hero-avatar pf-reveal"
      shape={variant === "centered" || variant === "card" ? "circle" : "rounded"}
    />
  ) : null;

  const scrollHint =
    showScrollHint && (variant === "fullscreen" || variant === "centered") ? (
      <div style={{ textAlign: "center" }}>
        <span className="pf-scroll-hint">Scroll</span>
      </div>
    ) : null;

  if (variant === "cover") {
    return (
      <div className="pf-hero" data-variant="cover">
        <div className="pf-hero-cover">
          {profile.cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary user URL
            <img src={profile.cover} alt="" />
          ) : null}
          <div className="pf-hero-cover-scrim" />
          {copy}
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="pf-hero" data-variant="card">
        <div className="pf-hero-card">
          {avatar}
          {copy}
        </div>
      </div>
    );
  }

  if (variant === "split") {
    return (
      <div className="pf-hero" data-variant="split">
        <div className="pf-hero-split">
          {copy}
          {avatar}
        </div>
      </div>
    );
  }

  // centered, fullscreen and minimal share a single stacked layout
  return (
    <div className="pf-hero" data-variant={variant}>
      {variant !== "minimal" ? avatar : null}
      {copy}
      {scrollHint}
    </div>
  );
}
