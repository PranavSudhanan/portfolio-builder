"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { FieldGroup, SelectField, TextArea, TextField } from "@/components/ui/Field";
import { ImageField } from "@/components/ui/ImageField";
import { useBuilder } from "@/lib/store";
import { move, uid } from "@/lib/utils";
import { SOCIAL_BY_KEY, SOCIAL_PLATFORMS, SocialIcon } from "@/renderer/icons";

export function ProfilePanel() {
  const { doc, update } = useBuilder();
  const profile = doc.profile;

  const setProfile = <K extends keyof typeof profile>(key: K, value: (typeof profile)[K]) =>
    update(
      (draft) => {
        draft.profile[key] = value;
      },
      { coalesce: `profile.${String(key)}` },
    );

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup title="Identity">
        <TextField
          label="Full name"
          value={profile.name}
          onChange={(v) => setProfile("name", v)}
          placeholder="Your name"
          help="Shown as the heading of your portfolio and résumé."
        />
        <TextField
          label="Headline"
          value={profile.headline}
          onChange={(v) => setProfile("headline", v)}
          placeholder="Senior Product Designer"
          help="The one-liner under your name."
        />
        <TextArea
          label="Tagline"
          value={profile.tagline}
          onChange={(v) => setProfile("tagline", v)}
          rows={2}
          help="A sentence about what you do and who you do it for."
        />
        <TextField
          label="Availability badge"
          value={profile.availability}
          onChange={(v) => setProfile("availability", v)}
          placeholder="Open to work"
          help="Leave empty to hide the badge."
        />
        <TextField
          label="Pronouns"
          value={profile.pronouns}
          onChange={(v) => setProfile("pronouns", v)}
          placeholder="they/them"
        />
      </FieldGroup>

      <FieldGroup title="Images">
        <ImageField
          label="Avatar"
          value={profile.avatar}
          onChange={(v) => setProfile("avatar", v)}
          help="Square images work best. Without one, your initials are shown."
        />
        <ImageField
          label="Cover image"
          value={profile.cover}
          onChange={(v) => setProfile("cover", v)}
          help="Used by the cover hero and the About section's image variant."
        />
      </FieldGroup>

      <FieldGroup title="Contact">
        <TextField
          label="Email"
          type="email"
          value={profile.email}
          onChange={(v) => setProfile("email", v)}
          placeholder="you@example.com"
          help="Used by the contact section and the contact form."
        />
        <TextField label="Phone" value={profile.phone} onChange={(v) => setProfile("phone", v)} placeholder="+91 98765 43210" />
        <TextField
          label="Location"
          value={profile.location}
          onChange={(v) => setProfile("location", v)}
          placeholder="City, Country"
        />
        <TextField label="Website" value={profile.website} onChange={(v) => setProfile("website", v)} placeholder="example.com" />
        <TextField
          label="Résumé URL"
          value={profile.resumeUrl}
          onChange={(v) => setProfile("resumeUrl", v)}
          placeholder="https://…/resume.pdf"
          help="Shows a download button in the About section."
        />
      </FieldGroup>

      <FieldGroup title={`Social links (${doc.socials.length})`}>
        <div className="flex flex-col gap-2">
          {doc.socials.map((social, index) => (
            <div key={social.id} className="ui-card flex flex-col gap-2 p-2.5">
              <div className="flex items-center gap-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-[var(--color-raised)] text-[var(--color-dim)]">
                  <SocialIcon platform={social.icon} size={14} />
                </span>
                <span className="flex-1 truncate text-[12.5px] font-medium">{social.label}</span>
                <button
                  type="button"
                  className="ui-icon-btn"
                  disabled={index === 0}
                  aria-label="Move up"
                  onClick={() =>
                    update((draft) => {
                      draft.socials = move(draft.socials, index, index - 1);
                    })
                  }
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  type="button"
                  className="ui-icon-btn"
                  disabled={index === doc.socials.length - 1}
                  aria-label="Move down"
                  onClick={() =>
                    update((draft) => {
                      draft.socials = move(draft.socials, index, index + 1);
                    })
                  }
                >
                  <ChevronDown size={13} />
                </button>
                <button
                  type="button"
                  className="ui-icon-btn"
                  data-tone="danger"
                  aria-label="Delete link"
                  onClick={() =>
                    update((draft) => {
                      draft.socials = draft.socials.filter((s) => s.id !== social.id);
                    })
                  }
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <SelectField
                value={social.icon ?? "other"}
                onChange={(value) =>
                  update((draft) => {
                    const target = draft.socials.find((s) => s.id === social.id);
                    if (!target) return;
                    target.icon = value;
                    const platform = SOCIAL_BY_KEY.get(value);
                    // Only rename when the label still matches the old platform,
                    // so a custom label the user typed is never clobbered.
                    const previous = SOCIAL_BY_KEY.get(social.icon ?? "");
                    if (platform && (!target.label || target.label === previous?.label)) {
                      target.label = platform.label;
                    }
                  })
                }
                options={SOCIAL_PLATFORMS.map((p) => ({ value: p.key, label: p.label }))}
              />
              <TextField
                value={social.label}
                onChange={(value) =>
                  update(
                    (draft) => {
                      const target = draft.socials.find((s) => s.id === social.id);
                      if (target) target.label = value;
                    },
                    { coalesce: `social.${social.id}.label` },
                  )
                }
                placeholder="Label"
              />
              <TextField
                value={social.url}
                onChange={(value) =>
                  update(
                    (draft) => {
                      const target = draft.socials.find((s) => s.id === social.id);
                      if (target) target.url = value;
                    },
                    { coalesce: `social.${social.id}.url` },
                  )
                }
                placeholder={SOCIAL_BY_KEY.get(social.icon ?? "other")?.placeholder ?? "https://"}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="ui-btn w-full"
          onClick={() =>
            update((draft) => {
              draft.socials.push({ id: uid("soc"), label: "Website", url: "", icon: "website" });
            })
          }
        >
          <Plus size={14} />
          Add social link
        </button>
      </FieldGroup>
    </div>
  );
}
