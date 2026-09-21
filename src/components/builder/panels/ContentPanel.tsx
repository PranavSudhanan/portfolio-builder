"use client";

import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import {
  Accordion,
  FieldGroup,
  SegmentedField,
  SelectField,
  SliderField,
  TextArea,
  TextField,
  ToggleField,
} from "@/components/ui/Field";
import { IconPicker } from "@/components/ui/IconPicker";
import { ImageField } from "@/components/ui/ImageField";
import { useSortable } from "@/components/ui/useSortable";
import { getSectionDef } from "@/lib/sections";
import { useBuilder } from "@/lib/store";
import type { Item, ItemFieldKey, Section } from "@/lib/types";
import { slugify, toLines, toTags, uniqueSlug } from "@/lib/utils";

/**
 * Editor for the selected section.
 *
 * Which controls appear is driven entirely by the section registry, so adding a
 * new section type in `lib/sections.ts` gives it a working editor for free.
 */

function ItemFields({
  sectionId,
  item,
  fields,
  parentItemId,
}: {
  sectionId: string;
  item: Item;
  fields: ItemFieldKey[];
  parentItemId?: string;
}) {
  const { patchItem } = useBuilder();
  const set = (patch: Partial<Item>, coalesceKey?: string) =>
    patchItem(sectionId, item.id, patch, {
      parentItemId,
      coalesce: coalesceKey ? `${item.id}.${coalesceKey}` : undefined,
    });

  return (
    <>
      {fields.includes("title") ? (
        <TextField label="Title" value={item.title ?? ""} onChange={(v) => set({ title: v }, "title")} />
      ) : null}

      {fields.includes("subtitle") ? (
        <TextField
          label="Subtitle"
          value={item.subtitle ?? ""}
          onChange={(v) => set({ subtitle: v }, "subtitle")}
          placeholder="Organisation, role or byline"
        />
      ) : null}

      {fields.includes("value") ? (
        <TextField
          label="Value"
          value={item.value ?? ""}
          onChange={(v) => set({ value: v }, "value")}
          placeholder="e.g. $4,800 or 12k"
        />
      ) : null}

      {fields.includes("period") ? (
        <TextField
          label="Period"
          value={item.period ?? ""}
          onChange={(v) => set({ period: v }, "period")}
          placeholder="2021 — Present"
        />
      ) : null}

      {fields.includes("location") ? (
        <TextField
          label="Location"
          value={item.location ?? ""}
          onChange={(v) => set({ location: v }, "location")}
          placeholder="Remote · Bengaluru"
        />
      ) : null}

      {fields.includes("description") ? (
        <TextArea
          label="Description"
          value={item.description ?? ""}
          onChange={(v) => set({ description: v }, "description")}
          rows={3}
        />
      ) : null}

      {fields.includes("bullets") ? (
        <TextArea
          label="Bullet points"
          value={(item.bullets ?? []).join("\n")}
          onChange={(v) => set({ bullets: toLines(v) }, "bullets")}
          rows={4}
          help="One per line."
        />
      ) : null}

      {fields.includes("tags") ? (
        <TextField
          label="Tags"
          value={(item.tags ?? []).join(", ")}
          onChange={(v) => set({ tags: toTags(v) }, "tags")}
          placeholder="React, TypeScript, Figma"
          help="Comma separated."
        />
      ) : null}

      {fields.includes("level") ? (
        <SliderField
          label="Proficiency"
          value={item.level ?? 0}
          onChange={(v) => set({ level: v }, "level")}
          min={0}
          max={100}
          suffix="%"
        />
      ) : null}

      {fields.includes("image") ? (
        <ImageField label="Image" value={item.image ?? ""} onChange={(v) => set({ image: v })} />
      ) : null}

      {fields.includes("icon") ? (
        <IconPicker value={item.icon} onChange={(v) => set({ icon: v })} />
      ) : null}

      {fields.includes("url") ? (
        <TextField
          label="Link"
          value={item.url ?? ""}
          onChange={(v) => set({ url: v }, "url")}
          placeholder="https://example.com or #contact"
        />
      ) : null}

      {fields.includes("urlLabel") ? (
        <TextField
          label="Link label"
          value={item.urlLabel ?? ""}
          onChange={(v) => set({ urlLabel: v }, "urlLabel")}
          placeholder="View project"
        />
      ) : null}

      {fields.includes("featured") ? (
        <ToggleField
          label="Feature this entry"
          value={item.featured === true}
          onChange={(v) => set({ featured: v })}
          help="Highlights it, and makes it span two columns in the Bento template."
        />
      ) : null}
    </>
  );
}

/**
 * A drag-to-reorder list of entries.
 *
 * Owns the sortable state for one level, so a section's entries and a skill
 * group's children each get their own independent list.
 */
function ItemList({
  section,
  items,
  parentItemId,
}: {
  section: Section;
  items: Item[];
  parentItemId?: string;
}) {
  const { moveItem } = useBuilder();
  const sortable = useSortable({
    scope: parentItemId ?? section.id,
    count: items.length,
    onReorder: (from, to) => moveItem(section.id, from, to, parentItemId),
  });

  return (
    <div className="flex flex-col gap-1.5" {...sortable.listProps}>
      {items.map((item, index) => (
        <div key={item.id} className="ui-sortable-item" {...sortable.itemProps(index)}>
          <ItemEditor
            section={section}
            item={item}
            index={index}
            total={items.length}
            parentItemId={parentItemId}
            grip={
              <span
                className="ui-grip self-stretch py-2.5"
                title="Drag to reorder"
                {...sortable.handleProps(index)}
              >
                <GripVertical size={13} />
              </span>
            }
          />
        </div>
      ))}
    </div>
  );
}

/** Editor for one entry, including nested children for grouped sections. */
function ItemEditor({
  section,
  item,
  index,
  total,
  parentItemId,
  grip,
}: {
  section: Section;
  item: Item;
  index: number;
  total: number;
  parentItemId?: string;
  grip?: React.ReactNode;
}) {
  const { addItem, removeItem, duplicateItem, moveItem } = useBuilder();
  const def = getSectionDef(section.type);
  const isGroup = Boolean(item.items);
  const label = item.title || item.description?.slice(0, 40) || `${def.itemLabel} ${index + 1}`;

  return (
    <Accordion
      title={label}
      left={grip}
      right={
        <div className="flex items-center">
          <button
            type="button"
            className="ui-icon-btn"
            onClick={() => moveItem(section.id, index, index - 1, parentItemId)}
            disabled={index === 0}
            aria-label="Move up"
          >
            <ChevronUp size={13} />
          </button>
          <button
            type="button"
            className="ui-icon-btn"
            onClick={() => moveItem(section.id, index, index + 1, parentItemId)}
            disabled={index === total - 1}
            aria-label="Move down"
          >
            <ChevronDown size={13} />
          </button>
          <button
            type="button"
            className="ui-icon-btn"
            onClick={() => duplicateItem(section.id, item.id, parentItemId)}
            aria-label="Duplicate"
          >
            <Copy size={13} />
          </button>
          <button
            type="button"
            className="ui-icon-btn"
            data-tone="danger"
            onClick={() => removeItem(section.id, item.id, parentItemId)}
            aria-label="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      }
    >
      {isGroup ? (
        <>
          <ItemFields sectionId={section.id} item={item} fields={["title"]} parentItemId={parentItemId} />
          <div className="mt-1 flex flex-col gap-1.5 border-l border-[var(--color-edge)] pl-2.5">
            <ItemList section={section} items={item.items ?? []} parentItemId={item.id} />
            <button type="button" className="ui-btn" onClick={() => addItem(section.id, item.id)}>
              <Plus size={13} />
              Add to {item.title || "group"}
            </button>
          </div>
        </>
      ) : (
        <ItemFields
          sectionId={section.id}
          item={item}
          fields={parentItemId ? (["title", "level", "subtitle"] as ItemFieldKey[]) : def.itemFields}
          parentItemId={parentItemId}
        />
      )}
    </Accordion>
  );
}

export function ContentPanel() {
  const { doc, selectedSection, patchSection, addItem, update } = useBuilder();

  if (!selectedSection) {
    return (
      <div className="ui-card p-5 text-center">
        <p className="text-[13px] text-[var(--color-dim)]">No section selected.</p>
        <p className="ui-help">Pick one from the Sections panel, or click a section in the preview.</p>
      </div>
    );
  }

  const section = selectedSection;
  const def = getSectionDef(section.type);
  const isGrouped = section.items.some((it) => it.items);

  const patch = (updates: Partial<Section>, coalesceKey?: string) =>
    patchSection(section.id, updates, {
      coalesce: coalesceKey ? `${section.id}.${coalesceKey}` : undefined,
    });

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup title={`${def.label} section`}>
        <p className="ui-help -mt-1">{def.description}</p>

        <SelectField
          label="Layout variant"
          value={section.variant}
          onChange={(v) => patch({ variant: v })}
          options={def.variants}
        />

        {def.hasColumns ? (
          <SegmentedField
            label="Columns"
            value={String(section.columns ?? 2)}
            onChange={(v) => patch({ columns: Number(v) })}
            options={[
              { value: "1", label: "1" },
              { value: "2", label: "2" },
              { value: "3", label: "3" },
              { value: "4", label: "4" },
            ]}
            help="Reduced automatically on narrow screens."
          />
        ) : null}
      </FieldGroup>

      <FieldGroup title="Heading">
        <TextField
          label="Title"
          value={section.title}
          onChange={(v) => patch({ title: v }, "title")}
          help="Also used as the label in navigation and tabs."
        />
        <TextField
          label="Eyebrow"
          value={section.eyebrow ?? ""}
          onChange={(v) => patch({ eyebrow: v }, "eyebrow")}
          placeholder="Small label above the title"
        />
        <TextArea
          label="Subtitle"
          value={section.subtitle ?? ""}
          onChange={(v) => patch({ subtitle: v }, "subtitle")}
          rows={2}
        />
        {def.hasBody ? (
          <TextArea
            label="Body copy"
            value={section.body ?? ""}
            onChange={(v) => patch({ body: v }, "body")}
            rows={7}
            help="Leave a blank line between paragraphs."
          />
        ) : null}
      </FieldGroup>

      {def.options.length > 0 ? (
        <FieldGroup title="Options">
          {def.options.map((option) => {
            const current = section.options[option.key];
            if (option.type === "toggle") {
              return (
                <ToggleField
                  key={option.key}
                  label={option.label}
                  help={option.help}
                  value={current !== false}
                  onChange={(v) =>
                    patch({ options: { ...section.options, [option.key]: v } })
                  }
                />
              );
            }
            if (option.type === "number") {
              return (
                <SliderField
                  key={option.key}
                  label={option.label}
                  help={option.help}
                  value={Number(current ?? option.min ?? 0)}
                  onChange={(v) => patch({ options: { ...section.options, [option.key]: v } })}
                  min={option.min ?? 0}
                  max={option.max ?? 100}
                  step={option.step ?? 1}
                />
              );
            }
            if (option.type === "select") {
              return (
                <SelectField
                  key={option.key}
                  label={option.label}
                  help={option.help}
                  value={String(current ?? option.options?.[0]?.value ?? "")}
                  onChange={(v) => patch({ options: { ...section.options, [option.key]: v } })}
                  options={option.options ?? []}
                />
              );
            }
            return (
              <TextField
                key={option.key}
                label={option.label}
                help={option.help}
                value={String(current ?? "")}
                onChange={(v) =>
                  patch({ options: { ...section.options, [option.key]: v } }, `option.${option.key}`)
                }
              />
            );
          })}
        </FieldGroup>
      ) : null}

      <FieldGroup title={`${def.itemLabel}s (${section.items.length})`}>
        {section.items.length > 1 ? (
          <p className="ui-help -mt-1">Drag the grip to reorder, or use the arrows.</p>
        ) : null}
        <ItemList section={section} items={section.items} />
        <button type="button" className="ui-btn w-full" onClick={() => addItem(section.id)}>
          <Plus size={14} />
          Add {isGrouped ? "group" : def.itemLabel.toLowerCase()}
        </button>
      </FieldGroup>

      <Accordion title="Advanced">
        <TextField
          label="Anchor"
          value={section.anchor}
          mono
          onChange={(v) => {
            const slug = slugify(v);
            const taken = doc.sections.filter((s) => s.id !== section.id).map((s) => s.anchor);
            patch({ anchor: uniqueSlug(slug, taken) }, "anchor");
          }}
          help="Used for in-page links, e.g. #about. Kept unique automatically."
        />
        <ToggleField
          label="Show this section"
          value={section.enabled}
          onChange={(v) => patch({ enabled: v })}
        />
        <ToggleField
          label="Show in navigation"
          value={section.inNav}
          onChange={(v) => patch({ inNav: v })}
        />
        <button
          type="button"
          className="ui-btn w-full"
          data-tone="ghost"
          onClick={() =>
            update((draft) => {
              const fresh = getSectionDef(section.type).sample();
              const target = draft.sections.find((s) => s.id === section.id);
              if (target) Object.assign(target, fresh, { id: target.id, anchor: target.anchor });
            })
          }
        >
          Reset to sample content
        </button>
      </Accordion>
    </div>
  );
}
