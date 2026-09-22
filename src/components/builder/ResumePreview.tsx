"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PAGE_SIZES } from "@/lib/resume";
import { useBuilder } from "@/lib/store";
import { Resume } from "@/renderer/Resume";
import { PreviewFrame } from "./PreviewFrame";

/** Millimetres to CSS pixels at the browser's nominal 96dpi. */
const MM_TO_PX = 96 / 25.4;

/**
 * The résumé preview.
 *
 * Rendered in its own iframe at the page's true pixel width, so millimetre and
 * point sizing resolves the same way it will on paper. The frame is then scaled
 * to fit the canvas — scaling the container rather than shrinking the page keeps
 * the measurements honest.
 */
export function ResumePreview({ scale }: { scale: number }) {
  const { doc } = useBuilder();
  const frameDocRef = useRef<Document | null>(null);
  // `handleReady` runs once, so it cannot close over the current paginate.
  const paginateRef = useRef<() => void>(() => {});
  const observerRef = useRef<MutationObserver | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  // Read inside `paginate`, which is memoised and must not be rebuilt for this.
  const fluidRef = useRef(false);
  // How wide the canvas actually is, so a sheet can never be wider than it.
  const [areaWidth, setAreaWidth] = useState(0);

  const page = PAGE_SIZES[doc.resume.pageSize] ?? PAGE_SIZES.a4;
  const pageWidthPx = Math.round(page.width * MM_TO_PX);
  const pageHeightPx = page.height * MM_TO_PX;
  const marginPx = doc.resume.margin * MM_TO_PX;

  /*
   * Below the width of the paper the preview stops imitating paper.
   *
   * Scaling an A4 sheet into a 375px column puts the type at 44% — legible in
   * the sense that the pixels are there, unreadable in every sense that
   * matters. The frame is rendered at the width it actually has instead, which
   * puts the résumé stylesheet under its own small-screen rules: one column,
   * full width, type with a floor in pixels. It is the same layout the
   * exported file gives a phone, which makes this an honest preview of it.
   */
  const fluid = areaWidth > 0 && areaWidth < pageWidthPx + 24;
  const frameWidth = fluid ? Math.max(320, Math.round(areaWidth)) : pageWidthPx;
  const fitted = fluid ? 1 : scale;

  const handleReady = useCallback((frameDoc: Document) => {
    frameDocRef.current = frameDoc;
    // The preview frame loads the portfolio stylesheet by default; the résumé
    // needs its own, and the surrounding grey makes the sheet read as paper.
    const link = frameDoc.createElement("link");
    link.rel = "stylesheet";
    link.href = "/resume.css";
    frameDoc.head.appendChild(link);
    const style = frameDoc.createElement("style");
    style.textContent = "html,body{background:#f4f5f7}body{padding:18px 0}";
    frameDoc.head.appendChild(style);

    /*
     * Re-paginate whenever the layout could have moved under us.
     *
     * A single timer after a render was not enough. Web fonts land after the
     * first paint and reflow every block, and editing the text inside an entry
     * changes its height without changing the section counts the effect below
     * keys on — so the guide lines stayed where the old layout put them and a
     * page break fell through the middle of a bullet list.
     *
     * The observer watches content, not attributes, so the inline margins
     * `paginate` writes cannot feed it back into itself.
     */
    // A short debounce rather than an animation frame: typing produces a burst
    // of mutations, and a background tab stops serving frames entirely — the
    // preview would then sit on a stale layout until it was looked at again.
    const schedule = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        paginateRef.current();
      }, 60);
    };

    void frameDoc.fonts?.ready.then(schedule).catch(() => {});

    observerRef.current?.disconnect();
    const observer = new MutationObserver(schedule);
    observer.observe(frameDoc.body, { childList: true, characterData: true, subtree: true });
    observerRef.current = observer;
  }, []);

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  /**
   * Push blocks that would straddle a page boundary onto the next page.
   *
   * The sheet is one continuous column on screen, so without this the preview
   * happily draws a heading across a page break that print would never produce —
   * `break-inside: avoid` moves those blocks when the document is actually
   * paginated. Reproducing that here is what makes the guide lines mean
   * something: they now sit where the real breaks fall.
   *
   * Two-column templates paginate **per column**. The browser fragments the grid
   * row, so the sidebar and the main column carry on independently down the next
   * page — pushing a block in one must not move anything in the other. Each
   * column is therefore walked separately, while the page boundaries stay in
   * shared sheet coordinates because both columns sit on the same paper.
   *
   * Only the preview does this. The export relies on the browser's own
   * pagination, which does the same thing from the CSS.
   */
  const paginate = useCallback(() => {
    const frameDoc = frameDocRef.current;
    const sheet = frameDoc?.querySelector<HTMLElement>(".rs-page");
    if (!frameDoc || !sheet) return;

    // A fluid preview has no page boundaries to push blocks across, and the
    // offsets from a previous paper layout would be left stranded mid-column.
    if (fluidRef.current) {
      for (const block of sheet.querySelectorAll<HTMLElement>("[style*='margin-top']")) block.style.marginTop = "";
      return;
    }

    const grid = sheet.querySelector<HTMLElement>(".rs-columns");
    // The grid's children are the two independent columns; otherwise the sheet
    // itself is the single column.
    const columns: HTMLElement[] = grid ? (Array.from(grid.children) as HTMLElement[]) : [sheet];

    const SELECTOR = ".rs-heading, .rs-entry, .rs-summary, .rs-skill-group, .rs-meter, .rs-aside-contact";
    // Clear every offset before measuring anything — leftovers from the previous
    // run would compound into the new positions.
    for (const column of columns) {
      for (const block of column.querySelectorAll<HTMLElement>(SELECTOR)) block.style.marginTop = "";
    }

    // The stylesheet owns the page padding; reading it back keeps the pushes
    // aligned with the guides rather than with a recomputed millimetre value.
    const pad = parseFloat(frameDoc.defaultView?.getComputedStyle(sheet).paddingTop ?? "") || marginPx;
    const usable = pageHeightPx - pad * 2;
    for (const column of columns) {
      for (const block of Array.from(column.querySelectorAll<HTMLElement>(SELECTOR))) {
        const rect = block.getBoundingClientRect();
        // A heading is measured together with what follows it, so it is never
        // left alone at the foot of a page — the same thing `break-after: avoid`
        // does in print.
        const next = block.classList.contains("rs-heading") ? block.nextElementSibling : null;
        const height = rect.height + (next?.getBoundingClientRect().height ?? 0);

        // A block taller than a page has to break; moving it gains nothing.
        if (rect.height <= 0 || height > usable) continue;

        const top = rect.top - sheet.getBoundingClientRect().top;
        const pageIndex = Math.floor(top / pageHeightPx);
        const bottomOfThisPage = pageIndex * pageHeightPx + pageHeightPx - pad;

        if (top + height > bottomOfThisPage) {
          const nextPageTop = (pageIndex + 1) * pageHeightPx + pad;
          block.style.marginTop = `${nextPageTop - top}px`;
        }
      }
    }
    sheet.setAttribute("data-paginated", "true");
  }, [pageHeightPx, marginPx]);

  useEffect(() => {
    fluidRef.current = fluid;
  }, [fluid]);

  // The observer in `handleReady` fires long after that callback closed over
  // its scope, so it reaches the current paginate through this ref.
  useEffect(() => {
    paginateRef.current = paginate;
  }, [paginate]);

  /*
   * Watch the canvas so the sheet can be made to fit it.
   *
   * A4 is 794px wide; the narrowest zoom on offer is 50%, which is still 397px
   * and wider than a phone. Without this the résumé could only be read through
   * a horizontal scrollbar on any screen narrower than the paper.
   */
  useEffect(() => {
    const area = areaRef.current;
    if (!area || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setAreaWidth(entry.contentRect.width));
    observer.observe(area);
    return () => observer.disconnect();
  }, []);

  /*
   * And measure after every render, because the observer does not cover the
   * one transition that matters most here: on a narrow screen the canvas starts
   * behind the editor pane, and an element with no box is not reported. The
   * guard keeps this from looping — a render only sets state when the width
   * genuinely moved.
   */
  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const width = area.getBoundingClientRect().width;
    setAreaWidth((previous) => (Math.abs(previous - width) > 1 ? width : previous));
  });

  // Re-run whenever anything that affects layout changes. A frame lets the
  // browser finish laying out the new content before it is measured.
  const layoutKey = JSON.stringify([doc.resume, doc.sections.map((s) => [s.id, s.enabled, s.items.length])]);
  useEffect(() => {
    const timer = setTimeout(paginate, 120);
    return () => clearTimeout(timer);
  }, [layoutKey, paginate]);


  return (
    <div ref={areaRef} className="flex h-full w-full justify-center overflow-auto thin-scroll bg-[var(--color-raised)]">
      <div style={{ width: frameWidth * fitted, flexShrink: 0 }}>
        <div
          style={{
            width: frameWidth,
            height: `${100 / fitted}%`,
            transform: fitted === 1 ? undefined : `scale(${fitted})`,
            transformOrigin: "top left",
          }}
        >
          <PreviewFrame
            fonts={[doc.resume.headingFont, doc.resume.bodyFont]}
            width={frameWidth}
            onReady={handleReady}
            className="h-full border-0"
          >
            <Resume doc={doc} guides />
          </PreviewFrame>
        </div>
      </div>
    </div>
  );
}
