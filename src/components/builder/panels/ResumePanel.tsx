"use client";

import { Check, ChevronDown, ChevronUp, PanelLeft, Rows3 } from "lucide-react";
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
import { FONTS, FONT_CATEGORIES } from "@/lib/fonts";
import { PAGE_SIZES, RESUME_SECTION_TYPES, RESUME_TEMPLATES, applyResumeTemplate } from "@/lib/resume";
import { getSectionDef } from "@/lib/sections";
import { useBuilder } from "@/lib/store";
import type { Density, PageSize, ResumeTemplateId, SectionType } from "@/lib/types";
import { move } from "@/lib/utils";

const FONT_GROUPS = FONT_CATEGORIES.map((category) => ({
  label: category.label,
  fonts: FONTS.filter((f) => f.category === category.value),
}));

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
        {FONT_GROUPS.map((group) => (
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

/** A reorderable list of the section types in one résumé column. */
function ColumnList({
  title,
  icon,
  types,
  onChange,
  onMove,
  moveLabel,
}: {
  title: string;
  icon: React.ReactNode;
  types: SectionType[];
  onChange: (next: SectionType[]) => void;
  onMove: (type: SectionType) => void;
  moveLabel: string;
}) {
  const { doc } = useBuilder();

  return (
    <div className="ui-card p-2.5">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-faint)]">
        {icon}
        {title}
      </div>
      {types.length === 0 ? (
        <p className="ui-help">Nothing here yet.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {types.map((type, index) => {
            const section = doc.sections.find((s) => s.type === type);
            const def = getSectionDef(type);
            return (
              <div key={type} className="flex items-center gap-1 rounded-lg px-1.5 py-1 hover:bg-[var(--color-hover)]">
                <span className="min-w-0 flex-1 truncate text-[12.5px]">
                  {section?.title || def.label}
                  {!section ? <span className="text-[var(--color-faint)]"> · not in document</span> : null}
                </span>
                <button
                  type="button"
                  className="ui-icon-btn"
                  disabled={index === 0}
                  aria-label="Move up"
                  onClick={() => onChange(move(types, index, index - 1))}
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  type="button"
                  className="ui-icon-btn"
                  disabled={index === types.length - 1}
                  aria-label="Move down"
                  onClick={() => onChange(move(types, index, index + 1))}
                >
                  <ChevronDown size={13} />
                </button>
                <button
                  type="button"
                  className="ui-btn px-2 py-1 text-[11px]"
                  onClick={() => onMove(type)}
                  title={moveLabel}
                >
                  {moveLabel}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ResumePanel() {
  const { doc, update } = useBuilder();
  const resume = doc.resume;
  const template = RESUME_TEMPLATES.find((t) => t.id === resume.template) ?? RESUME_TEMPLATES[0];

  const set = <K extends keyof typeof resume>(key: K, value: (typeof resume)[K]) =>
    update(
      (draft) => {
        draft.resume[key] = value;
      },
      { coalesce: `resume.${String(key)}` },
    );

  /** Section types present in the document but not yet on the résumé. */
  const unused = RESUME_SECTION_TYPES.filter(
    (type) =>
      doc.sections.some((s) => s.type === type && s.enabled) &&
      !resume.sections.includes(type) &&
      !resume.sidebar.includes(type),
  );

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup title="Résumé template">
        <p className="ui-help -mt-1">
          The résumé uses the same content as your portfolio — the same roles, the same skills — with its own order and
          page setup.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {RESUME_TEMPLATES.map((item) => (
            <button
              key={item.id}
              type="button"
              className="ui-tile p-2.5"
              data-selected={resume.template === item.id ? "true" : "false"}
              onClick={() =>
                update((draft) => {
                  draft.resume = applyResumeTemplate(draft.resume, item.id as ResumeTemplateId);
                })
              }
              title={item.description}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12.5px] font-medium">{item.label}</span>
                {resume.template === item.id ? <Check size={12} className="text-[var(--color-brand)]" /> : null}
              </div>
              <span className="mt-0.5 block text-[10.5px] leading-snug text-[var(--color-faint)]">
                {item.twoColumn ? "Two column" : "Single column"} · {item.bestFor[0]}
              </span>
            </button>
          ))}
        </div>
        <p className="ui-help">{template.description}</p>
      </FieldGroup>

      <FieldGroup title="Page">
        <SelectField
          label="Page size"
          value={resume.pageSize}
          onChange={(v) => set("pageSize", v as PageSize)}
          options={Object.entries(PAGE_SIZES).map(([value, size]) => ({ value, label: size.label }))}
        />
        <SliderField
          label="Margin"
          value={resume.margin}
          onChange={(v) => set("margin", v)}
          min={8}
          max={28}
          suffix="mm"
          help="Below 12mm some printers clip the edges."
        />
        <SegmentedField<Density>
          label="Density"
          value={resume.density}
          onChange={(v) => set("density", v)}
          options={[
            { value: "tight", label: "Tight" },
            { value: "normal", label: "Normal" },
            { value: "airy", label: "Airy" },
          ]}
        />
      </FieldGroup>

      <FieldGroup title="Type">
        <FontSelect label="Heading font" value={resume.headingFont} onChange={(v) => set("headingFont", v)} />
        <FontSelect label="Body font" value={resume.bodyFont} onChange={(v) => set("bodyFont", v)} />
        <SliderField
          label="Body size"
          value={resume.fontSize}
          onChange={(v) => set("fontSize", v)}
          min={8}
          max={13}
          step={0.5}
          suffix="pt"
          help="Recruiters rarely enjoy anything below 9.5pt."
        />
        <SliderField
          label="Line height"
          value={resume.lineHeight}
          onChange={(v) => set("lineHeight", v)}
          min={1.15}
          max={1.8}
          step={0.02}
        />
        <ColorField label="Accent" value={resume.accent} onChange={(v) => set("accent", v)} />
        <ToggleField
          label="Uppercase section headings"
          value={resume.upperHeadings}
          onChange={(v) => set("upperHeadings", v)}
        />
        <ToggleField label="Rule under headings" value={resume.headingRule} onChange={(v) => set("headingRule", v)} />
        <ToggleField label="Contact icons" value={resume.showIcons} onChange={(v) => set("showIcons", v)} />
        <ToggleField
          label="Show photo"
          value={resume.showPhoto}
          onChange={(v) => set("showPhoto", v)}
          help="Uses your profile avatar. Leave off for markets where photos are discouraged."
        />
      </FieldGroup>

      <FieldGroup title="Summary">
        <TextArea
          value={resume.summary}
          onChange={(v) => set("summary", v)}
          rows={5}
          placeholder={doc.sections.find((s) => s.type === "about")?.body?.slice(0, 120) ?? "Two or three lines…"}
          help="Leave empty to reuse the About section's text."
        />
      </FieldGroup>

      <FieldGroup title="Layout">
        <ColumnList
          title="Main column"
          icon={<Rows3 size={12} />}
          types={resume.sections}
          onChange={(next) => set("sections", next)}
          moveLabel={template.twoColumn ? "Side" : "Hide"}
          onMove={(type) =>
            update((draft) => {
              draft.resume.sections = draft.resume.sections.filter((t) => t !== type);
              if (template.twoColumn) draft.resume.sidebar.push(type);
            })
          }
        />

        {template.twoColumn ? (
          <ColumnList
            title="Sidebar"
            icon={<PanelLeft size={12} />}
            types={resume.sidebar}
            onChange={(next) => set("sidebar", next)}
            moveLabel="Main"
            onMove={(type) =>
              update((draft) => {
                draft.resume.sidebar = draft.resume.sidebar.filter((t) => t !== type);
                draft.resume.sections.push(type);
              })
            }
          />
        ) : null}

        {unused.length > 0 ? (
          <Accordion title={`Not on the résumé (${unused.length})`}>
            {unused.map((type) => {
              const section = doc.sections.find((s) => s.type === type);
              return (
                <button
                  key={type}
                  type="button"
                  className="ui-btn w-full justify-between"
                  onClick={() =>
                    update((draft) => {
                      draft.resume.sections.push(type);
                    })
                  }
                >
                  <span>{section?.title || getSectionDef(type).label}</span>
                  <span className="text-[11px] text-[var(--color-faint)]">Add</span>
                </button>
              );
            })}
          </Accordion>
        ) : null}
      </FieldGroup>
    </div>
  );
}
