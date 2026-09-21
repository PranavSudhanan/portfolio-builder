"use client";

import { AlertTriangle, Check } from "lucide-react";
import {
  Accordion,
  ColorField,
  FieldGroup,
  SegmentedField,
  SelectField,
  SliderField,
  TextArea,
  ToggleField,
} from "@/components/ui/Field";
import { FONTS, FONT_CATEGORIES, FONT_PAIRINGS } from "@/lib/fonts";
import { useBuilder } from "@/lib/store";
import { THEME_PRESETS, applyThemePreset, counterpartPreset } from "@/lib/themes";
import type {
  BackdropPattern,
  ButtonStyle,
  CardStyle,
  ContainerWidth,
  Density,
  FontScale,
  HeadingCase,
  Palette,
  ShadowLevel,
} from "@/lib/types";
import { contrastRatio } from "@/lib/utils";

const FONT_OPTIONS = FONT_CATEGORIES.map((category) => ({
  label: category.label,
  fonts: FONTS.filter((f) => f.category === category.value),
}));

/** Font picker grouped by category, so 40 families stay navigable. */
function FontSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <span className="ui-label">{label}</span>
      <select className="ui-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {FONT_OPTIONS.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.fonts.map((font) => (
              <option key={font.name} value={font.name}>
                {font.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

const PALETTE_KEYS: { key: keyof Palette; label: string }[] = [
  { key: "bg", label: "Background" },
  { key: "surface", label: "Surface" },
  { key: "elevated", label: "Elevated" },
  { key: "text", label: "Text" },
  { key: "muted", label: "Muted text" },
  { key: "border", label: "Border" },
  { key: "primary", label: "Primary" },
  { key: "onPrimary", label: "On primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
];

/** Warn when a custom palette drops below WCAG AA for body text. */
function ContrastCheck({ palette }: { palette: Palette }) {
  const checks = [
    { label: "Text on background", ratio: contrastRatio(palette.text, palette.bg), min: 4.5 },
    { label: "Muted on background", ratio: contrastRatio(palette.muted, palette.bg), min: 4.5 },
    { label: "Label on primary", ratio: contrastRatio(palette.onPrimary, palette.primary), min: 4.5 },
  ];
  const failing = checks.filter((c) => c.ratio < c.min);

  if (failing.length === 0) {
    return (
      <p className="flex items-center gap-1.5 text-[11px] text-[var(--color-mint)]">
        <Check size={12} /> Contrast passes WCAG AA
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[var(--color-amber)]/35 bg-[var(--color-amber)]/8 p-2.5">
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-amber)]">
        <AlertTriangle size={12} /> Low contrast
      </p>
      {failing.map((c) => (
        <p key={c.label} className="text-[11px] text-[var(--color-faint)]">
          {c.label}: {c.ratio.toFixed(1)}:1 — aim for {c.min}:1
        </p>
      ))}
    </div>
  );
}

export function ThemePanel() {
  const { doc, update } = useBuilder();
  const theme = doc.theme;

  const setTheme = <K extends keyof typeof theme>(key: K, value: (typeof theme)[K]) =>
    update(
      (draft) => {
        draft.theme[key] = value;
      },
      { coalesce: `theme.${String(key)}` },
    );

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup title="Colour preset">
        <div className="grid grid-cols-2 gap-2">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="ui-tile p-0 overflow-hidden"
              data-selected={theme.presetId === preset.id ? "true" : "false"}
              onClick={() =>
                update((draft) => {
                  // Keep the visitor-facing alternate paired with the new preset,
                  // unless the user picked a specific one in Settings.
                  if (draft.site.altThemePresetId === counterpartPreset(draft.theme.presetId)) {
                    draft.site.altThemePresetId = counterpartPreset(preset.id);
                  }
                  draft.theme = applyThemePreset(draft.theme, preset.id);
                })
              }
              title={preset.vibe}
            >
              <div className="flex h-12 items-stretch" style={{ background: preset.palette.bg }}>
                <div className="flex flex-1 flex-col justify-center gap-1 p-2">
                  <div className="h-1.5 w-2/3 rounded-full" style={{ background: preset.palette.text }} />
                  <div className="h-1 w-1/2 rounded-full" style={{ background: preset.palette.muted }} />
                </div>
                <div className="flex w-8 flex-col">
                  <div className="flex-1" style={{ background: preset.palette.primary }} />
                  <div className="flex-1" style={{ background: preset.palette.secondary }} />
                  <div className="flex-1" style={{ background: preset.palette.accent }} />
                </div>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5">
                <span className="text-[12px] font-medium">{preset.name}</span>
                {theme.presetId === preset.id ? <Check size={12} className="text-[var(--color-brand)]" /> : null}
              </div>
            </button>
          ))}
        </div>
      </FieldGroup>

      <Accordion title="Custom colours">
        <div className="grid grid-cols-2 gap-2.5">
          {PALETTE_KEYS.map(({ key, label }) => (
            <ColorField
              key={key}
              label={label}
              value={theme.palette[key]}
              onChange={(value) =>
                update(
                  (draft) => {
                    draft.theme.palette[key] = value;
                    draft.theme.presetId = "custom";
                  },
                  { coalesce: `palette.${key}` },
                )
              }
            />
          ))}
        </div>
        <ContrastCheck palette={theme.palette} />
      </Accordion>

      <FieldGroup title="Typography">
        <SelectField
          label="Font pairing"
          value={
            FONT_PAIRINGS.find((p) => p.heading === theme.headingFont && p.body === theme.bodyFont)?.label ?? "custom"
          }
          onChange={(label) => {
            const pairing = FONT_PAIRINGS.find((p) => p.label === label);
            if (!pairing) return;
            update((draft) => {
              draft.theme.headingFont = pairing.heading;
              draft.theme.bodyFont = pairing.body;
            });
          }}
          options={[
            { value: "custom", label: "Custom" },
            ...FONT_PAIRINGS.map((p) => ({ value: p.label, label: p.label })),
          ]}
        />
        <FontSelect label="Heading font" value={theme.headingFont} onChange={(v) => setTheme("headingFont", v)} />
        <FontSelect label="Body font" value={theme.bodyFont} onChange={(v) => setTheme("bodyFont", v)} />
        <FontSelect label="Monospace font" value={theme.monoFont} onChange={(v) => setTheme("monoFont", v)} />

        <SegmentedField<FontScale>
          label="Type scale"
          value={theme.fontScale}
          onChange={(v) => setTheme("fontScale", v)}
          options={[
            { value: "compact", label: "S" },
            { value: "normal", label: "M" },
            { value: "comfortable", label: "L" },
            { value: "grand", label: "XL" },
          ]}
        />
        <SliderField
          label="Heading weight"
          value={theme.headingWeight}
          onChange={(v) => setTheme("headingWeight", v)}
          min={300}
          max={900}
          step={100}
        />
        <SegmentedField<HeadingCase>
          label="Heading case"
          value={theme.headingCase}
          onChange={(v) => setTheme("headingCase", v)}
          options={[
            { value: "none", label: "As typed" },
            { value: "upper", label: "UPPER" },
            { value: "title", label: "Title" },
          ]}
        />
        <SliderField
          label="Letter spacing"
          value={theme.letterSpacing}
          onChange={(v) => setTheme("letterSpacing", v)}
          min={-0.05}
          max={0.12}
          step={0.005}
          suffix="em"
        />
        <SliderField
          label="Line height"
          value={theme.lineHeight}
          onChange={(v) => setTheme("lineHeight", v)}
          min={1.3}
          max={2}
          step={0.05}
        />
      </FieldGroup>

      <FieldGroup title="Layout">
        <SegmentedField<ContainerWidth>
          label="Content width"
          value={theme.container}
          onChange={(v) => setTheme("container", v)}
          options={[
            { value: "narrow", label: "Narrow" },
            { value: "normal", label: "Normal" },
            { value: "wide", label: "Wide" },
            { value: "full", label: "Full" },
          ]}
          help="Full uses the whole screen, which is the default. The others cap at 1100, 1440 or 1800 pixels. Paragraphs keep a readable line length whichever you pick."
        />
        <SegmentedField<Density>
          label="Spacing"
          value={theme.density}
          onChange={(v) => setTheme("density", v)}
          options={[
            { value: "tight", label: "Tight" },
            { value: "normal", label: "Normal" },
            { value: "airy", label: "Airy" },
          ]}
        />
        <SliderField
          label="Corner radius"
          value={theme.radius}
          onChange={(v) => setTheme("radius", v)}
          min={0}
          max={32}
          suffix="px"
        />
        <SegmentedField<ShadowLevel>
          label="Shadow"
          value={theme.shadow}
          onChange={(v) => setTheme("shadow", v)}
          options={[
            { value: "none", label: "None" },
            { value: "soft", label: "Soft" },
            { value: "medium", label: "Medium" },
            { value: "strong", label: "Strong" },
          ]}
        />
        <SelectField
          label="Button style"
          value={theme.buttonStyle}
          onChange={(v) => setTheme("buttonStyle", v as ButtonStyle)}
          options={[
            { value: "solid", label: "Solid" },
            { value: "outline", label: "Outline" },
            { value: "ghost", label: "Ghost" },
            { value: "gradient", label: "Gradient" },
            { value: "soft", label: "Soft pill" },
          ]}
        />
        <SelectField
          label="Card style"
          value={theme.cardStyle}
          onChange={(v) => setTheme("cardStyle", v as CardStyle)}
          options={[
            { value: "flat", label: "Flat — no card" },
            { value: "bordered", label: "Bordered" },
            { value: "elevated", label: "Elevated" },
            { value: "glass", label: "Glass" },
            { value: "outline", label: "Outline only" },
          ]}
        />
      </FieldGroup>

      <FieldGroup title="Effects">
        <ToggleField
          label="Gradient accents"
          value={theme.gradient.enabled}
          onChange={(v) =>
            update((draft) => {
              draft.theme.gradient.enabled = v;
            })
          }
          help="Used by headings, stats, avatars and gradient buttons."
        />
        {theme.gradient.enabled ? (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <ColorField
                label="Gradient from"
                value={theme.gradient.from}
                onChange={(v) =>
                  update(
                    (draft) => {
                      draft.theme.gradient.from = v;
                    },
                    { coalesce: "gradient.from" },
                  )
                }
              />
              <ColorField
                label="Gradient to"
                value={theme.gradient.to}
                onChange={(v) =>
                  update(
                    (draft) => {
                      draft.theme.gradient.to = v;
                    },
                    { coalesce: "gradient.to" },
                  )
                }
              />
            </div>
            <SliderField
              label="Gradient angle"
              value={theme.gradient.angle}
              onChange={(v) =>
                update(
                  (draft) => {
                    draft.theme.gradient.angle = v;
                  },
                  { coalesce: "gradient.angle" },
                )
              }
              min={0}
              max={360}
              suffix="°"
            />
          </>
        ) : null}

        <SelectField
          label="Page backdrop"
          value={theme.backdrop.pattern}
          onChange={(v) =>
            update((draft) => {
              draft.theme.backdrop.pattern = v as BackdropPattern;
            })
          }
          options={[
            { value: "none", label: "None" },
            { value: "mesh", label: "Colour mesh" },
            { value: "dots", label: "Dot grid" },
            { value: "grid", label: "Line grid" },
            { value: "rays", label: "Rays" },
            { value: "waves", label: "Waves" },
            { value: "noise", label: "Film grain" },
          ]}
        />
        {theme.backdrop.pattern !== "none" ? (
          <SliderField
            label="Backdrop strength"
            value={Math.round(theme.backdrop.opacity * 100)}
            onChange={(v) =>
              update(
                (draft) => {
                  draft.theme.backdrop.opacity = v / 100;
                },
                { coalesce: "backdrop.opacity" },
              )
            }
            min={0}
            max={100}
            suffix="%"
          />
        ) : null}

        <ToggleField
          label="Motion and hover effects"
          value={theme.animations}
          onChange={(v) => setTheme("animations", v)}
          help="Reveal on scroll, hover lifts and the marquee. Visitors who prefer reduced motion never see these."
        />
      </FieldGroup>

      <Accordion title="Custom CSS">
        <TextArea
          value={theme.customCss}
          onChange={(v) => setTheme("customCss", v)}
          rows={8}
          placeholder={".pf-hero-name { text-decoration: underline; }"}
          help="Appended to the portfolio stylesheet in the preview, exports and published page. Portfolio classes are prefixed pf-."
        />
      </Accordion>
    </div>
  );
}
