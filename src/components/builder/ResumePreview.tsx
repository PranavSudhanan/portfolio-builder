"use client";

import { useCallback, useEffect, useRef } from "react";
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

  const page = PAGE_SIZES[doc.resume.pageSize] ?? PAGE_SIZES.a4;
  const pageWidthPx = Math.round(page.width * MM_TO_PX);
  const pageHeightPx = page.height * MM_TO_PX;
  const marginPx = doc.resume.margin * MM_TO_PX;

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
  }, []);

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

    const grid = sheet.querySelector<HTMLElement>(".rs-columns");
    // The grid's children are the two independent columns; otherwise the sheet
    // itself is the single column.
    const columns: HTMLElement[] = grid ? (Array.from(grid.children) as HTMLElement[]) : [sheet];

    const SELECTOR = ".rs-heading, .rs-entry, .rs-summary, .rs-skill-group, .rs-meter";
    // Clear every offset before measuring anything — leftovers from the previous
    // run would compound into the new positions.
    for (const column of columns) {
      for (const block of column.querySelectorAll<HTMLElement>(SELECTOR)) block.style.marginTop = "";
    }

    const usable = pageHeightPx - marginPx * 2;
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
        const bottomOfThisPage = pageIndex * pageHeightPx + pageHeightPx - marginPx;

        if (top + height > bottomOfThisPage) {
          const nextPageTop = (pageIndex + 1) * pageHeightPx + marginPx;
          block.style.marginTop = `${nextPageTop - top}px`;
        }
      }
    }
    sheet.setAttribute("data-paginated", "true");
  }, [pageHeightPx, marginPx]);

  // Re-run whenever anything that affects layout changes. A frame lets the
  // browser finish laying out the new content before it is measured.
  const layoutKey = JSON.stringify([doc.resume, doc.sections.map((s) => [s.id, s.enabled, s.items.length])]);
  useEffect(() => {
    const timer = setTimeout(paginate, 120);
    return () => clearTimeout(timer);
  }, [layoutKey, paginate]);

  return (
    <div className="flex h-full w-full justify-center overflow-auto thin-scroll bg-[var(--color-raised)]">
      <div style={{ width: pageWidthPx * scale, flexShrink: 0 }}>
        <div
          style={{
            width: pageWidthPx,
            height: `${100 / scale}%`,
            transform: scale === 1 ? undefined : `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <PreviewFrame
            fonts={[doc.resume.headingFont, doc.resume.bodyFont]}
            width={pageWidthPx}
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
