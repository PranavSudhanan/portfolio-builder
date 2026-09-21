"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Eye, EyeOff, GripVertical, Plus, Trash2, X } from "lucide-react";
import { FieldGroup } from "@/components/ui/Field";
import { useSortable } from "@/components/ui/useSortable";
import { SECTION_DEFS, SECTION_GROUPS, getSectionDef } from "@/lib/sections";
import { useBuilder } from "@/lib/store";
import { Icon } from "@/renderer/icons";

/** The "add a section" sheet, grouped by purpose. */
function SectionLibrary({ onClose }: { onClose: () => void }) {
  const { doc, addSection } = useBuilder();
  const used = new Set(doc.sections.map((s) => s.type));

  return (
    <div className="ui-card ui-fade flex flex-col gap-4 p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-medium">Add a section</h3>
        <button type="button" className="ui-icon-btn" onClick={onClose} aria-label="Close section library">
          <X size={14} />
        </button>
      </div>

      {SECTION_GROUPS.map((group) => {
        const defs = SECTION_DEFS.filter((d) => d.group === group.id);
        if (defs.length === 0) return null;
        return (
          <div key={group.id}>
            <h4 className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[var(--color-faint)]">
              {group.label}
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {defs.map((def) => {
                const blocked = Boolean(def.singleton && used.has(def.type));
                return (
                  <button
                    key={def.type}
                    type="button"
                    className="ui-tile flex items-start gap-2 p-2 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={blocked}
                    title={blocked ? `Only one ${def.label} section is allowed` : def.description}
                    onClick={() => {
                      addSection(def.type);
                      onClose();
                    }}
                  >
                    <span className="mt-0.5 text-[var(--color-brand-soft)]">
                      <Icon name={def.icon} size={14} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12px] font-medium">{def.label}</span>
                      <span className="block text-[10.5px] leading-snug text-[var(--color-faint)]">
                        {def.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SectionsPanel() {
  const {
    doc,
    selectedSectionId,
    selectSection,
    toggleSection,
    removeSection,
    duplicateSection,
    moveSection,
    reorderSections,
    patchSection,
  } = useBuilder();

  const [showLibrary, setShowLibrary] = useState(false);
  const sortable = useSortable({
    scope: "sections",
    count: doc.sections.length,
    onReorder: reorderSections,
  });

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup title={`Sections (${doc.sections.length})`}>
        <p className="ui-help -mt-1">Drag the grip to reorder. Click a section to edit its content.</p>

        <div className="flex flex-col gap-1" {...sortable.listProps}>
          {doc.sections.map((section, index) => {
            const def = getSectionDef(section.type);
            const selected = section.id === selectedSectionId;
            return (
              <div
                key={section.id}
                className="ui-sortable-item ui-tile flex items-center gap-1.5 p-2"
                data-selected={selected ? "true" : "false"}
                {...sortable.itemProps(index)}
              >
                <span className="ui-grip self-stretch" title="Drag to reorder" {...sortable.handleProps(index)}>
                  <GripVertical size={14} />
                </span>

                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  onClick={() => selectSection(section.id, { openContent: true })}
                >
                  <span className={selected ? "text-[var(--color-brand-soft)]" : "text-[var(--color-faint)]"}>
                    <Icon name={def.icon} size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate text-[12.5px] font-medium"
                      style={{ opacity: section.enabled ? 1 : 0.45 }}
                    >
                      {section.title || def.label}
                    </span>
                    <span className="block truncate text-[10.5px] text-[var(--color-faint)]">
                      {def.label} · {def.variants.find((v) => v.value === section.variant)?.label ?? section.variant}
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  className="ui-icon-btn"
                  onClick={() => moveSection(section.id, -1)}
                  disabled={index === 0}
                  aria-label="Move section up"
                  title="Move up"
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  type="button"
                  className="ui-icon-btn"
                  onClick={() => moveSection(section.id, 1)}
                  disabled={index === doc.sections.length - 1}
                  aria-label="Move section down"
                  title="Move down"
                >
                  <ChevronDown size={13} />
                </button>
                <button
                  type="button"
                  className="ui-icon-btn"
                  onClick={() => toggleSection(section.id)}
                  aria-label={section.enabled ? "Hide section" : "Show section"}
                  title={section.enabled ? "Hide from the site" : "Show on the site"}
                >
                  {section.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button
                  type="button"
                  className="ui-icon-btn"
                  onClick={() => duplicateSection(section.id)}
                  aria-label="Duplicate section"
                  title="Duplicate"
                >
                  <Copy size={13} />
                </button>
                <button
                  type="button"
                  className="ui-icon-btn"
                  data-tone="danger"
                  onClick={() => removeSection(section.id)}
                  aria-label="Delete section"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>

        {showLibrary ? (
          <SectionLibrary onClose={() => setShowLibrary(false)} />
        ) : (
          <button type="button" className="ui-btn w-full" onClick={() => setShowLibrary(true)}>
            <Plus size={14} />
            Add section
          </button>
        )}
      </FieldGroup>

      <FieldGroup title="In navigation">
        <p className="ui-help -mt-1">Choose which sections appear in the nav bar, tabs or dock.</p>
        <div className="flex flex-col gap-1">
          {doc.sections.map((section) => (
            <label
              key={section.id}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-[var(--color-hover)]"
            >
              <span className="truncate text-[12.5px]" style={{ opacity: section.enabled ? 1 : 0.45 }}>
                {section.title || getSectionDef(section.type).label}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={section.inNav}
                aria-label={`Show ${section.title} in navigation`}
                className="ui-switch"
                data-on={section.inNav ? "true" : "false"}
                onClick={() => patchSection(section.id, { inNav: !section.inNav })}
              />
            </label>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}
