"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Editor form controls.
 *
 * Text inputs keep their own local draft state and push upward on every
 * keystroke. The draft exists so the caret never jumps when the store round-trips
 * a value, and so an external change (undo, preset switch, project load) still
 * replaces what is on screen.
 */

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="ui-label flex items-center justify-between gap-2">
      <span>{children}</span>
      {hint ? <span className="font-normal normal-case tracking-normal text-[var(--color-faint)]">{hint}</span> : null}
    </span>
  );
}

function useDraft(value: string, onChange: (next: string) => void) {
  const [draft, setDraft] = useState(value);
  const dirty = useRef(false);

  useEffect(() => {
    // Adopt the incoming value unless the user is mid-edit on this control.
    if (!dirty.current) setDraft(value);
  }, [value]);

  return {
    value: draft,
    onChange: (next: string) => {
      dirty.current = true;
      setDraft(next);
      onChange(next);
    },
    onBlur: () => {
      dirty.current = false;
      setDraft(value);
    },
  };
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  help,
  type = "text",
  mono = false,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  help?: string;
  type?: string;
  mono?: boolean;
}) {
  const id = useId();
  const draft = useDraft(value, onChange);
  return (
    <div>
      {label ? (
        <label htmlFor={id}>
          <Label>{label}</Label>
        </label>
      ) : null}
      <input
        id={id}
        className="ui-input"
        type={type}
        value={draft.value}
        placeholder={placeholder}
        onChange={(e) => draft.onChange(e.target.value)}
        onBlur={draft.onBlur}
        style={mono ? { fontFamily: "var(--font-mono)", fontSize: "12px" } : undefined}
      />
      {help ? <p className="ui-help">{help}</p> : null}
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  help,
  rows = 4,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  help?: string;
  rows?: number;
}) {
  const id = useId();
  const draft = useDraft(value, onChange);
  return (
    <div>
      {label ? (
        <label htmlFor={id}>
          <Label>{label}</Label>
        </label>
      ) : null}
      <textarea
        id={id}
        className="ui-textarea"
        rows={rows}
        value={draft.value}
        placeholder={placeholder}
        onChange={(e) => draft.onChange(e.target.value)}
        onBlur={draft.onBlur}
      />
      {help ? <p className="ui-help">{help}</p> : null}
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  help,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  help?: string;
}) {
  const id = useId();
  return (
    <div>
      {label ? (
        <label htmlFor={id}>
          <Label>{label}</Label>
        </label>
      ) : null}
      <select id={id} className="ui-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {help ? <p className="ui-help">{help}</p> : null}
    </div>
  );
}

export function ToggleField({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  help?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <div className="min-w-0">
        <div className="text-[13px] text-[var(--color-body)]">{label}</div>
        {help ? <p className="ui-help">{help}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        className="ui-switch mt-0.5"
        data-on={value ? "true" : "false"}
        onClick={() => onChange(!value)}
      />
    </div>
  );
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = "",
  help,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  help?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>
        <Label hint={`${value}${suffix}`}>{label}</Label>
      </label>
      <input
        id={id}
        className="ui-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {help ? <p className="ui-help">{help}</p> : null}
    </div>
  );
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const draft = useDraft(value, (next) => {
    // Only push complete hex values upward so the preview never flickers while
    // the user is halfway through typing one.
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(next.trim())) onChange(next.trim());
  });
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          className="ui-color"
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} colour picker`}
        />
        <input
          className="ui-input"
          value={draft.value}
          onChange={(e) => draft.onChange(e.target.value)}
          onBlur={draft.onBlur}
          spellCheck={false}
          style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  );
}

export function SegmentedField<T extends string>({
  label,
  value,
  onChange,
  options,
  help,
}: {
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  help?: string;
}) {
  return (
    <div>
      {label ? <Label>{label}</Label> : null}
      <div className="ui-seg w-full" style={{ display: "flex" }}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className="flex-1"
            data-active={value === option.value ? "true" : "false"}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {help ? <p className="ui-help">{help}</p> : null}
    </div>
  );
}

/** Collapsible group used to keep long panels navigable. */
export function Accordion({
  title,
  children,
  defaultOpen = false,
  left,
  right,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Rendered before the disclosure button — used for the drag grip. */
  left?: ReactNode;
  right?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="ui-card overflow-hidden">
      <div className="flex items-center gap-1.5 px-2.5">
        {left}
        <button
          type="button"
          className="flex flex-1 items-center gap-2 py-2.5 text-left text-[13px] font-medium"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <ChevronDown
            size={14}
            className="text-[var(--color-faint)] transition-transform"
            style={{ transform: open ? "none" : "rotate(-90deg)" }}
          />
          {title}
        </button>
        {right}
      </div>
      {open ? <div className="flex flex-col gap-3 border-t border-[var(--color-edge-soft)] p-3">{children}</div> : null}
    </div>
  );
}

/** Titled block used to separate concerns inside a panel. */
export function FieldGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      {title ? (
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-[var(--color-faint)]">{title}</h3>
      ) : null}
      {children}
    </section>
  );
}

/**
 * Multi-select chips — the guided builder's main input.
 *
 * Reports which option was toggled rather than the whole next array. Handing
 * back an array computed from the `value` prop loses a selection when two chips
 * are clicked inside one render, because the second handler still closes over
 * the stale prop; a toggle lets the parent apply it functionally.
 */
export function ChipSelect({
  label,
  options,
  value,
  onToggle,
  help,
}: {
  label?: string;
  options: string[];
  value: string[];
  onToggle: (option: string) => void;
  help?: string;
}) {
  const selected = new Set(value);
  return (
    <div>
      {label ? <Label hint={selected.size > 0 ? `${selected.size} selected` : undefined}>{label}</Label> : null}
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const on = selected.has(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={on}
              className="rounded-full border px-2.5 py-1 text-[12px] transition-colors"
              style={{
                borderColor: on ? "var(--color-brand)" : "var(--color-edge)",
                background: on ? "rgb(90 75 240 / 0.10)" : "transparent",
                color: on ? "var(--color-brand-soft)" : "var(--color-dim)",
              }}
              onClick={() => onToggle(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
      {help ? <p className="ui-help">{help}</p> : null}
    </div>
  );
}
