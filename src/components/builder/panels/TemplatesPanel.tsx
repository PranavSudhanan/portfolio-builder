"use client";

import { Check } from "lucide-react";
import { createDoc } from "@/lib/defaults";
import { PRESETS } from "@/lib/presets";
import { useBuilder } from "@/lib/store";
import { TEMPLATES } from "@/lib/templates";
import type { NavStyle, TemplateId } from "@/lib/types";
import { FieldGroup, SelectField } from "@/components/ui/Field";
import { Icon } from "@/renderer/icons";
import { TemplateThumb } from "../TemplateThumb";

const NAV_OPTIONS: { value: NavStyle; label: string }[] = [
  { value: "top", label: "Top bar" },
  { value: "tabs", label: "Tabs" },
  { value: "side", label: "Side rail" },
  { value: "dock", label: "Floating dock" },
  { value: "minimal", label: "Minimal links" },
  { value: "none", label: "No navigation" },
];

export function TemplatesPanel() {
  const { doc, update, replaceDoc } = useBuilder();

  function chooseTemplate(id: TemplateId) {
    const template = TEMPLATES.find((t) => t.id === id);
    if (!template) return;
    update((draft) => {
      draft.template = id;
      draft.nav.style = template.defaultNav;
      // Layout hints only — the user's colours and fonts are never overwritten.
      if (template.themeHints) {
        const layout = { ...template.themeHints };
        delete layout.headingFont;
        delete layout.bodyFont;
        Object.assign(draft.theme, layout);
      }
    });
  }

  function applyPreset(presetId: string) {
    const fresh = createDoc(presetId, doc.name);
    // Keep the project identity and whatever the user has already written about
    // themselves; only structure, template and styling come from the preset.
    fresh.id = doc.id;
    fresh.createdAt = doc.createdAt;
    fresh.profile = { ...fresh.profile, ...stripEmpty(doc.profile) };
    fresh.socials = doc.socials;
    replaceDoc(fresh);
  }

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup title="Template">
        <p className="ui-help -mt-1">
          Templates change layout and navigation only. Your colours, fonts and content stay as they are.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((template) => {
            const selected = doc.template === template.id;
            return (
              <button
                key={template.id}
                type="button"
                className="ui-tile p-0 overflow-hidden"
                data-selected={selected ? "true" : "false"}
                onClick={() => chooseTemplate(template.id)}
                title={template.description}
              >
                <TemplateThumb id={template.id} />
                <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                  <span className="text-[12px] font-medium">{template.label}</span>
                  {selected ? <Check size={13} className="text-[var(--color-brand)]" /> : null}
                </div>
              </button>
            );
          })}
        </div>
        <p className="ui-help">{TEMPLATES.find((t) => t.id === doc.template)?.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATES.find((t) => t.id === doc.template)?.bestFor.map((tag) => (
            <span key={tag} className="ui-chip">
              {tag}
            </span>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup title="Navigation">
        <SelectField
          label="Navigation style"
          value={doc.nav.style}
          onChange={(value) =>
            update((draft) => {
              draft.nav.style = value as NavStyle;
            })
          }
          options={NAV_OPTIONS}
          help="Overrides the style the template ships with."
        />
      </FieldGroup>

      <FieldGroup title="Start from a profession">
        <p className="ui-help -mt-1">
          Replaces the sections, template and colours with a set tuned for that field. Your name, contact details and
          social links are kept.
        </p>
        <div className="flex flex-col gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="ui-tile flex items-center gap-3"
              data-selected={doc.presetId === preset.id ? "true" : "false"}
              onClick={() => applyPreset(preset.id)}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--color-raised)] text-[var(--color-brand-soft)]">
                <Icon name={preset.icon} size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-medium">{preset.label}</span>
                <span className="block truncate text-[11px] text-[var(--color-faint)]">{preset.description}</span>
              </span>
            </button>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

/** Drop empty strings so a preset's sample copy fills the gaps. */
function stripEmpty<T extends object>(input: T): Partial<T> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string" && value.trim()) out[key] = value;
  }
  return out as Partial<T>;
}
