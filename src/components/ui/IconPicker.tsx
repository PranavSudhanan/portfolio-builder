"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { ICON_PICKER_GROUPS, Icon } from "@/renderer/icons";
import { Label } from "./Field";

/** Grid-based icon chooser used by item editors and highlight cards. */
export function IconPicker({
  label = "Icon",
  value,
  onChange,
}: {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="ui-btn flex-1 justify-start"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {value ? (
            <>
              <Icon name={value} size={15} />
              <span className="text-[12px]">{value}</span>
            </>
          ) : (
            <span className="text-[12px] text-[var(--color-faint)]">Choose an icon</span>
          )}
        </button>
        {value ? (
          <button type="button" className="ui-icon-btn" onClick={() => onChange("")} aria-label="Remove icon">
            <X size={13} />
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="ui-card ui-fade mt-2 max-h-64 overflow-y-auto thin-scroll p-2.5">
          {ICON_PICKER_GROUPS.map((group) => (
            <div key={group.label} className="mb-2.5 last:mb-0">
              <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[var(--color-faint)]">
                {group.label}
              </div>
              <div className="grid grid-cols-8 gap-1">
                {group.names.map((name) => (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    aria-label={name}
                    className="grid aspect-square place-items-center rounded-md border transition-colors"
                    style={{
                      borderColor: value === name ? "var(--color-brand)" : "transparent",
                      background: value === name ? "rgba(90,75,240,0.10)" : "transparent",
                      color: value === name ? "var(--color-brand-soft)" : "var(--color-dim)",
                    }}
                    onClick={() => {
                      onChange(name);
                      setOpen(false);
                    }}
                  >
                    <Icon name={name} size={15} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
