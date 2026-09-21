"use client";

import { useRef } from "react";
import { useBuilder } from "@/lib/store";
import { PortfolioPreview } from "./PortfolioPreview";
import { ResumePreview } from "./ResumePreview";

/*
 * The preview sits on the canvas like a sheet on a desk: a hairline, a soft
 * shadow and rounded corners. Without it a dark portfolio butts straight up
 * against the white chrome and the two read as one broken screen rather than as
 * an editor and the thing being edited.
 */
const FRAME =
  "h-full overflow-hidden rounded-xl border border-[var(--color-edge)] shadow-[0_1px_2px_rgba(16,18,26,0.05),0_8px_24px_-12px_rgba(16,18,26,0.12)]";

const DEVICE_WIDTH: Record<string, number | undefined> = {
  desktop: undefined,
  tablet: 834,
  mobile: 390,
};

/**
 * The preview canvas.
 *
 * Holds the preview, sized to the chosen device width and zoom. It renders the
 * same document the panels are editing, so an edit shows up as it is made.
 */
export function Canvas() {
  const { device, zoom, outputMode } = useBuilder();
  const areaRef = useRef<HTMLDivElement>(null);

  const width = DEVICE_WIDTH[device];
  const isFramed = device !== "desktop";

  // The résumé is a paged document, so it ignores device widths entirely and
  // uses the zoom control to fit the sheet instead.
  if (outputMode === "resume") {
    return (
      <div ref={areaRef} className="h-full w-full min-w-0">
        <ResumePreview scale={zoom} />
      </div>
    );
  }

  return (
    <div ref={areaRef} className="flex h-full w-full min-w-0">
      {/*
        No `justify-center` here: when zoomed out the wrapper is deliberately
        wider than this box, and centring it would push its left edge negative.
        The wrapper centres the framed device widths itself.
      */}
      <div
        className="flex h-full min-w-0 flex-1 items-start thin-scroll bg-[var(--color-raised)] p-2.5"
        style={{
          // Zoomed out, the wrapper is scaled to fit exactly, so there is
          // nothing to scroll to sideways — but the browser still measures the
          // untransformed box and would show a phantom scrollbar. At 100% the
          // usual behaviour applies, so a tablet frame wider than the canvas
          // can still be panned.
          overflowX: zoom === 1 ? "auto" : "hidden",
          overflowY: "auto",
        }}
      >
        {/*
          Zooming out widens the frame as well as shrinking it, so the preview
          lays out at a larger viewport and shows the layout that viewport really
          gets. Scaling alone would only make the same breakpoint smaller, which
          is not what a zoom control is for — and it is what lets the desktop
          layout stay visible while the mobile companion is open.
        */}
        <div
          // `shrink-0` matters: as a flex item the wrapper would otherwise be
          // shrunk straight back to the container width, undoing the widening.
          className="flex h-full shrink-0 justify-center"
          style={{
            width: `${100 / zoom}%`,
            height: `${100 / zoom}%`,
            transform: zoom === 1 ? undefined : `scale(${zoom})`,
            // Scaling from the top-left maps the widened wrapper exactly onto
            // the visible area. A centred origin would leave the untransformed
            // box hanging off the right, which the scroll container counts as
            // overflow even though nothing is drawn there.
            transformOrigin: "top left",
          }}
        >
          <PortfolioPreview
            interactive
            width={width}
            className={
              isFramed
                ? FRAME + " shrink-0 bg-white"
                : FRAME + " w-full"
            }
          />
        </div>
      </div>
    </div>
  );
}
