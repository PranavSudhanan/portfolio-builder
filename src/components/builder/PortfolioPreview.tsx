"use client";

import { useCallback, useEffect, useRef } from "react";
import { useBuilder } from "@/lib/store";
import { Portfolio } from "@/renderer/Portfolio";
import { RUNTIME_JS } from "@/renderer/runtime";
import { PreviewFrame } from "./PreviewFrame";

/**
 * One live portfolio preview.
 *
 * Shared by the main canvas and the mobile companion so both stay byte-identical
 * to what gets exported, and so a change made in the editor lands in every open
 * preview at once — they all render the same `doc` from the store.
 *
 * `interactive` adds the builder-only affordances: hovering outlines a section
 * and clicking one selects it. The companion leaves them off, since two frames
 * competing to drive the selection would be more confusing than useful.
 */
export function PortfolioPreview({
  width,
  className,
  interactive = false,
}: {
  /** Fixed pixel width, or undefined to fill the container. */
  width?: number;
  className?: string;
  interactive?: boolean;
}) {
  const { doc, selectedSection, selectSection } = useBuilder();
  const frameDocRef = useRef<Document | null>(null);

  const handleReady = useCallback(
    (frameDoc: Document) => {
      frameDocRef.current = frameDoc;
      if (!interactive) return;

      // Scoped to the frame, so these never reach an export.
      const style = frameDoc.createElement("style");
      style.textContent = `
        [data-pf-section] { position: relative; }
        [data-pf-section]::after {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          border: 1.5px solid transparent; border-radius: 10px;
          transition: border-color 160ms ease, background 160ms ease;
        }
        [data-pf-section]:hover::after { border-color: rgba(90,75,240,0.45); }
        [data-pf-section][data-selected="true"]::after {
          border-color: #5a4bf0; background: rgba(90,75,240,0.05);
        }
      `;
      frameDoc.head.appendChild(style);
    },
    [interactive],
  );

  // Click a section in the canvas to select it in the editor.
  useEffect(() => {
    const frameDoc = frameDocRef.current;
    if (!frameDoc || !interactive) return;
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("[data-pf-section]")?.getAttribute("data-pf-section");
      if (!anchor) return;
      const match = doc.sections.find((s) => s.anchor === anchor);
      if (match) selectSection(match.id, { openContent: true });
    }
    frameDoc.addEventListener("click", onClick);
    return () => frameDoc.removeEventListener("click", onClick);
  }, [doc.sections, interactive, selectSection]);

  // Re-run the portfolio runtime when the structure changes, so tabs, the
  // accordion and reveals behave here exactly as they will on the published page.
  const structureKey = doc.sections.map((s) => `${s.id}:${s.enabled}:${s.variant}`).join("|");
  useEffect(() => {
    const frameDoc = frameDocRef.current;
    if (!frameDoc) return;
    const timer = setTimeout(() => {
      frameDoc.getElementById("pf-runtime")?.remove();
      const script = frameDoc.createElement("script");
      script.id = "pf-runtime";
      script.textContent = RUNTIME_JS;
      frameDoc.body.appendChild(script);
    }, 60);
    return () => clearTimeout(timer);
  }, [structureKey, doc.template, doc.nav.style]);

  return (
    <PreviewFrame
      fonts={[doc.theme.headingFont, doc.theme.bodyFont, doc.theme.monoFont]}
      width={width}
      onReady={handleReady}
      className={className}
    >
      <Portfolio
        doc={doc}
        staticMode
        activeAnchor={selectedSection?.anchor ?? doc.sections.find((s) => s.enabled)?.anchor}
        highlightAnchor={interactive ? selectedSection?.anchor : undefined}
      />
    </PreviewFrame>
  );
}
