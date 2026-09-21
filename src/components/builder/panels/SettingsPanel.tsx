"use client";

import { FieldGroup, SelectField, TextArea, TextField, ToggleField } from "@/components/ui/Field";
import { useBuilder } from "@/lib/store";
import { THEME_PRESETS } from "@/lib/themes";
import { displayName, joinTitle } from "@/lib/utils";

export function SettingsPanel() {
  const { doc, update } = useBuilder();
  const site = doc.site;
  const nav = doc.nav;

  const setSite = <K extends keyof typeof site>(key: K, value: (typeof site)[K]) =>
    update(
      (draft) => {
        draft.site[key] = value;
      },
      { coalesce: `site.${String(key)}` },
    );

  const setNav = <K extends keyof typeof nav>(key: K, value: (typeof nav)[K]) =>
    update(
      (draft) => {
        draft.nav[key] = value;
      },
      { coalesce: `nav.${String(key)}` },
    );

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup title="Project">
        <TextField
          label="Project name"
          value={doc.name}
          onChange={(v) =>
            update(
              (draft) => {
                draft.name = v;
              },
              { coalesce: "doc.name" },
            )
          }
          placeholder="Untitled project"
          help="Only visible to you, in the projects list. Leave it blank if you like."
        />
      </FieldGroup>

      <FieldGroup title="Page metadata">
        <TextField
          label="Browser title"
          value={site.title}
          onChange={(v) => setSite("title", v)}
          placeholder={joinTitle(displayName(doc.profile.name), doc.profile.headline)}
          help="Leave empty to use your name and headline."
        />
        <TextArea
          label="Meta description"
          value={site.description}
          onChange={(v) => setSite("description", v)}
          rows={3}
          placeholder={doc.profile.tagline}
          help="Shown in search results and link previews."
        />
        <TextField
          label="Favicon"
          value={site.favicon}
          onChange={(v) => setSite("favicon", v)}
          placeholder="✦"
          help="A single emoji, rendered as the tab icon."
        />
        <SelectField
          label="Language"
          value={site.language}
          onChange={(v) => setSite("language", v)}
          options={[
            { value: "en", label: "English" },
            { value: "hi", label: "Hindi" },
            { value: "es", label: "Spanish" },
            { value: "fr", label: "French" },
            { value: "de", label: "German" },
            { value: "pt", label: "Portuguese" },
            { value: "ja", label: "Japanese" },
            { value: "zh", label: "Chinese" },
            { value: "ar", label: "Arabic" },
          ]}
        />
      </FieldGroup>

      <FieldGroup title="Navigation bar">
        <ToggleField label="Stick to the top when scrolling" value={nav.sticky} onChange={(v) => setNav("sticky", v)} />
        <ToggleField label="Show name beside the logo" value={nav.showName} onChange={(v) => setNav("showName", v)} />
        <TextField
          label="Logo text"
          value={nav.logo}
          onChange={(v) => setNav("logo", v)}
          placeholder={displayName(doc.profile.name)}
          help="Leave empty to use your name."
        />
        <TextField
          label="Call-to-action label"
          value={nav.ctaLabel}
          onChange={(v) => setNav("ctaLabel", v)}
          placeholder="Hire me"
          help="Leave empty to hide the button."
        />
        <TextField label="Call-to-action link" value={nav.ctaUrl} onChange={(v) => setNav("ctaUrl", v)} placeholder="#contact" />
      </FieldGroup>

      <FieldGroup title="Visitor experience">
        <ToggleField
          label="Colour scheme toggle"
          value={site.themeToggle}
          onChange={(v) => setSite("themeToggle", v)}
          help="A floating button that lets visitors switch between two palettes."
        />
        {site.themeToggle ? (
          <SelectField
            label="Alternate palette"
            value={site.altThemePresetId}
            onChange={(v) => setSite("altThemePresetId", v)}
            options={THEME_PRESETS.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.mode})`,
            }))}
            help="Shown when a visitor flips the toggle."
          />
        ) : null}
        <ToggleField
          label="Reveal sections on scroll"
          value={site.scrollAnimations}
          onChange={(v) => setSite("scrollAnimations", v)}
        />
      </FieldGroup>

      <FieldGroup title="Footer">
        <TextField
          label="Footer text"
          value={site.footerText}
          onChange={(v) => setSite("footerText", v)}
          placeholder={`© ${new Date().getFullYear()} ${displayName(doc.profile.name)}`}
        />
        <ToggleField
          label="Show “Built with Portfolio Builder”"
          value={site.showBranding}
          onChange={(v) => setSite("showBranding", v)}
        />
      </FieldGroup>
    </div>
  );
}
