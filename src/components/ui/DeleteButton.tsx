"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2, X } from "lucide-react";

/**
 * A delete control that asks once before it acts.
 *
 * Two things this deliberately does not do. It is not hidden until hover —
 * an action nobody can see is an action nobody can use, and on a touch screen
 * there is no hover at all, so the button was simply unreachable. And it does
 * not delete on the first click: a saved project is the only copy there is,
 * localStorage has no undo, and the button now sits in plain sight where it can
 * be hit by accident.
 *
 * The confirmation is inline rather than a dialog — it keeps the answer next to
 * the thing being deleted, and it disarms itself if it is left alone.
 */
export function DeleteButton({
  label,
  onDelete,
  size = 14,
}: {
  /** What is being deleted, for the accessible name: "Delete Portfolio 2026". */
  label: string;
  onDelete: () => void;
  size?: number;
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const disarm = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setArmed(false);
  };

  // A pending timer must never fire into an unmounted row.
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  if (armed) {
    return (
      <span className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          className="ui-btn"
          data-tone="danger"
          style={{ padding: "3px 9px", fontSize: "11.5px", height: "auto" }}
          autoFocus
          onClick={() => {
            disarm();
            onDelete();
          }}
        >
          Delete
        </button>
        <button type="button" className="ui-icon-btn" aria-label="Keep it" onClick={disarm}>
          <X size={size} />
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      className="ui-icon-btn opacity-55 transition-opacity hover:opacity-100 focus-visible:opacity-100"
      data-tone="danger"
      aria-label={`Delete ${label}`}
      title={`Delete ${label}`}
      onClick={() => {
        setArmed(true);
        timer.current = setTimeout(() => setArmed(false), 5000);
      }}
    >
      <Trash2 size={size} />
    </button>
  );
}
