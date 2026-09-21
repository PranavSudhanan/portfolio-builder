"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { googleFontsHref } from "@/lib/fonts";

/**
 * Renders the portfolio inside a real iframe.
 *
 * An iframe rather than a scaled `div` because the portfolio's media queries
 * have to resolve against the device width being previewed — a 390px-wide div
 * inside a 1400px window still matches desktop breakpoints, which would make
 * the mobile preview a lie.
 */

const BASE_DOC = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/portfolio.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link id="pf-fonts" rel="stylesheet" href="">
<style>html,body{margin:0;padding:0;height:100%}body{overflow-x:hidden}</style>
</head><body><div id="pf-mount"></div></body></html>`;

export function PreviewFrame({
  children,
  fonts,
  width,
  className,
  onReady,
}: {
  children: ReactNode;
  /** Font families to load into the frame. */
  fonts: string[];
  /** Fixed pixel width, or undefined to fill the container. */
  width?: number;
  className?: string;
  onReady?: (doc: Document) => void;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [mount, setMount] = useState<HTMLElement | null>(null);

  // Write the shell document once the iframe element exists. `about:blank`
  // frames are same-origin, so document.write is available and synchronous.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const doc = frame.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(BASE_DOC);
    doc.close();

    const node = doc.getElementById("pf-mount");
    if (node) {
      setMount(node);
      onReady?.(doc);
    }
    return () => setMount(null);
    // onReady is intentionally excluded: re-writing the document on every
    // parent render would destroy and rebuild the preview each keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the Google Fonts link in sync with the theme's font choices.
  const fontsKey = fonts.join(",");
  useEffect(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;
    const link = doc.getElementById("pf-fonts") as HTMLLinkElement | null;
    if (!link) return;
    const href = googleFontsHref(fonts);
    if (href && link.href !== href) link.href = href;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsKey, mount]);

  return (
    <>
      <iframe
        ref={frameRef}
        title="Portfolio preview"
        className={className}
        style={width ? { width: `${width}px` } : undefined}
      />
      {mount ? createPortal(children, mount) : null}
    </>
  );
}
