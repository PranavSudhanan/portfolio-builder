"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent, type PointerEvent } from "react";

/**
 * Drag-to-reorder for a list of rows.
 *
 * Built on the native HTML5 drag API rather than a library: the lists here are
 * short, the rows are plain DOM, and this keeps the dependency list at zero.
 *
 * Two details matter for the editor panels:
 *
 * - **Dragging is armed by a handle.** Rows contain text inputs, and a row that
 *   is permanently `draggable` swallows text selection inside them. The row only
 *   becomes draggable while its grip is held.
 * - **Lists are scoped.** A section's items and a skill group's children are
 *   separate lists rendered inside one another, so each drag advertises a MIME
 *   type carrying its scope and lists ignore anything that is not theirs.
 *
 * Native drag events do not fire on touch devices. The up/down buttons beside
 * each row remain the accessible and touch path, so reordering never depends on
 * this alone.
 */

interface SortableOptions {
  /** Distinct per list — nested lists must not accept each other's rows. */
  scope: string;
  count: number;
  /** Receives indices in the same form as `move()` in `lib/utils`. */
  onReorder: (from: number, to: number) => void;
}

/** Pixels from a scroll container's edge at which auto-scrolling kicks in. */
const EDGE = 48;
const SCROLL_STEP = 12;

function mimeFor(scope: string): string {
  // Custom MIME types are lowercased by the browser; ids are already lowercase
  // but normalising keeps the dragover check honest.
  return `application/x-pb-sortable-${scope}`.toLowerCase();
}

/** Nearest ancestor that actually scrolls vertically. */
function scrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current) {
    const overflow = getComputedStyle(current).overflowY;
    if (/(auto|scroll)/.test(overflow) && current.scrollHeight > current.clientHeight) return current;
    current = current.parentElement;
  }
  return null;
}

export function useSortable({ scope, count, onReorder }: SortableOptions) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [armed, setArmed] = useState<number | null>(null);
  /** Insertion point, 0…count. `null` when nothing is hovering this list. */
  const [slot, setSlot] = useState<number | null>(null);

  const mime = mimeFor(scope);
  const autoScroll = useRef<{ node: HTMLElement; direction: number } | null>(null);
  const frame = useRef<number | null>(null);

  const stopAutoScroll = useCallback(() => {
    autoScroll.current = null;
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  }, []);

  // Scrolling runs on its own frame loop rather than off dragover, so holding
  // still at the edge of a long list keeps scrolling.
  const startAutoScroll = useCallback(() => {
    if (frame.current !== null) return;
    const step = () => {
      const target = autoScroll.current;
      if (target) target.node.scrollTop += target.direction * SCROLL_STEP;
      frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => stopAutoScroll, [stopAutoScroll]);

  const reset = useCallback(() => {
    setDragIndex(null);
    setArmed(null);
    setSlot(null);
    stopAutoScroll();
  }, [stopAutoScroll]);

  const commit = useCallback(
    (target: number | null) => {
      const from = dragIndex;
      reset();
      if (from === null || target === null) return;
      // `target` is a slot between rows; convert it to the post-removal index.
      const to = target > from ? target - 1 : target;
      if (to !== from) onReorder(from, to);
    },
    [dragIndex, onReorder, reset],
  );

  /** Props for the grip. Holding it makes the row draggable. */
  const handleProps = useCallback(
    (index: number) => ({
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        // Let the browser start a native drag rather than a text selection.
        event.stopPropagation();
        setArmed(index);
      },
      onPointerUp: () => setArmed(null),
      onPointerCancel: () => setArmed(null),
      style: { cursor: "grab", touchAction: "none" as const },
    }),
    [],
  );

  const itemProps = useCallback(
    (index: number) => ({
      draggable: armed === index,
      "data-dragging": dragIndex === index ? "true" : undefined,
      "data-drop": slot === index ? "before" : slot === count && index === count - 1 ? "after" : undefined,

      onDragStart: (event: DragEvent<HTMLElement>) => {
        // A nested row sits inside one of its parent list's rows, so without
        // this the ancestor would also register a drag and fade itself out.
        event.stopPropagation();
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData(mime, String(index));
        // Some browsers require a plain-text payload for the drag to begin.
        event.dataTransfer.setData("text/plain", String(index));
        setDragIndex(index);
        autoScroll.current = null;
        const node = scrollParent(event.currentTarget);
        if (node) {
          autoScroll.current = { node, direction: 0 };
          startAutoScroll();
        }
      },

      onDragEnd: (event: DragEvent<HTMLElement>) => {
        event.stopPropagation();
        reset();
      },

      onDragOver: (event: DragEvent<HTMLElement>) => {
        if (!event.dataTransfer.types.includes(mime)) return;
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = "move";

        const rect = event.currentTarget.getBoundingClientRect();
        const after = event.clientY > rect.top + rect.height / 2;
        setSlot(after ? index + 1 : index);

        const target = autoScroll.current;
        if (target) {
          const bounds = target.node.getBoundingClientRect();
          target.direction =
            event.clientY < bounds.top + EDGE ? -1 : event.clientY > bounds.bottom - EDGE ? 1 : 0;
        }
      },

      onDrop: (event: DragEvent<HTMLElement>) => {
        if (!event.dataTransfer.types.includes(mime)) return;
        event.preventDefault();
        event.stopPropagation();
        const rect = event.currentTarget.getBoundingClientRect();
        commit(event.clientY > rect.top + rect.height / 2 ? index + 1 : index);
      },
    }),
    [armed, commit, count, dragIndex, mime, reset, slot, startAutoScroll],
  );

  /**
   * Props for the element wrapping the rows, so a drop landing in the gaps
   * between them still counts instead of silently cancelling.
   */
  const listProps = {
    onDragOver: (event: DragEvent<HTMLElement>) => {
      if (!event.dataTransfer.types.includes(mime)) return;
      event.preventDefault();
      event.stopPropagation();
    },
    onDrop: (event: DragEvent<HTMLElement>) => {
      if (!event.dataTransfer.types.includes(mime)) return;
      event.preventDefault();
      event.stopPropagation();
      commit(slot);
    },
    onDragLeave: (event: DragEvent<HTMLElement>) => {
      // Only clear when the pointer has actually left the list, not when it
      // crosses between two rows inside it.
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setSlot(null);
    },
  };

  return { listProps, itemProps, handleProps, isDragging: dragIndex !== null };
}
