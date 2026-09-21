"use client";

import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { Portfolio } from "@/renderer/Portfolio";
import { Resume } from "@/renderer/Resume";
import { RUNTIME_JS } from "@/renderer/runtime";
import { googleFontsHref } from "./fonts";
import { PAGE_SIZES } from "./resume";
import type { PortfolioDoc } from "./types";
import { displayName, escapeHtml, joinTitle } from "./utils";

/**
 * Standalone HTML export.
 *
 * Produces one self-contained file: the portfolio stylesheet is inlined, the
 * markup comes from the very same React components the builder previews, and
 * the runtime script is embedded. The only external request is the Google Fonts
 * stylesheet, and the page degrades to system fonts without it.
 *
 * Rendered in the browser rather than on a server. `react-dom/server` cannot be
 * imported in the App Router, and doing it client-side is truer to how the rest
 * of the builder works — no document ever leaves the machine.
 */

/** Render a React tree to a markup string using a detached DOM root. */
function renderToMarkup(node: React.ReactNode): string {
  const host = document.createElement("div");
  const root = createRoot(host);
  // `render` is asynchronous by default; flushSync forces it to complete before
  // innerHTML is read.
  flushSync(() => root.render(node));
  const markup = host.innerHTML;
  root.unmount();
  return markup;
}

const stylesheetCache = new Map<string, string>();

/** Fetch a stylesheet from `public/` — the same file the previews use. */
async function loadStylesheet(name: string): Promise<string> {
  const cached = stylesheetCache.get(name);
  if (cached !== undefined) return cached;
  const response = await fetch(`/${name}`);
  if (!response.ok) throw new Error(`Could not load ${name} (${response.status}).`);
  const text = await response.text();
  stylesheetCache.set(name, text);
  return text;
}

/** Emoji → an SVG data URI usable as a favicon. */
function emojiFavicon(emoji: string): string {
  const glyph = emoji.trim() || "✦";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="88">${escapeHtml(
    glyph,
  )}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Person schema so search engines can read the basics. */
function jsonLd(doc: PortfolioDoc): string {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: displayName(doc.profile.name),
    jobTitle: doc.profile.headline,
    description: doc.profile.tagline,
  };
  if (doc.profile.email) data.email = doc.profile.email;
  if (doc.profile.website) data.url = doc.profile.website;
  if (doc.profile.location) data.address = { "@type": "PostalAddress", addressLocality: doc.profile.location };
  const links = doc.socials.map((s) => s.url).filter(Boolean);
  if (links.length > 0) data.sameAs = links;

  // Escaping `<` stops a value containing "</script>" from closing the tag early.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}

export async function renderPortfolioHtml(doc: PortfolioDoc): Promise<string> {
  const stylesheet = await loadStylesheet("portfolio.css");
  const markup = renderToMarkup(<Portfolio doc={doc} staticMode={!doc.site.scrollAnimations} />);

  const title = doc.site.title.trim() || joinTitle(displayName(doc.profile.name), doc.profile.headline);
  const description = doc.site.description || doc.profile.tagline;
  const fontsHref = googleFontsHref([doc.theme.headingFont, doc.theme.bodyFont, doc.theme.monoFont]);

  const fontLinks = fontsHref
    ? `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontsHref}">`
    : "";

  return `<!doctype html>
<html lang="${escapeHtml(doc.site.language || "en")}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="author" content="${escapeHtml(displayName(doc.profile.name))}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="color-scheme" content="${doc.theme.mode}">
<meta name="theme-color" content="${escapeHtml(doc.theme.palette.bg)}">
<link rel="icon" href="${emojiFavicon(doc.site.favicon)}">
${fontLinks}
<style>
html,body{margin:0;padding:0;min-height:100%}
body{background:${doc.theme.palette.bg}}
${stylesheet}
</style>
${jsonLd(doc)}
</head>
<body>
${markup}
<script>${RUNTIME_JS}</script>
</body>
</html>
`;
}

/**
 * Standalone résumé HTML.
 *
 * Also the print path: the page carries an `@page` rule matching the chosen
 * paper size, so "Save as PDF" in the browser produces a correctly sized file
 * with no margins fighting the layout.
 */
export async function renderResumeHtml(doc: PortfolioDoc, options: { autoPrint?: boolean } = {}): Promise<string> {
  const stylesheet = await loadStylesheet("resume.css");
  const markup = renderToMarkup(<Resume doc={doc} />);
  const page = PAGE_SIZES[doc.resume.pageSize] ?? PAGE_SIZES.a4;
  const title = joinTitle(displayName(doc.profile.name), doc.profile.headline);
  const fontsHref = googleFontsHref([doc.resume.headingFont, doc.resume.bodyFont]);

  return `<!doctype html>
<html lang="${escapeHtml(doc.site.language || "en")}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(doc.site.description || doc.profile.tagline)}">
<link rel="icon" href="${emojiFavicon(doc.site.favicon)}">
${fontsHref ? `<link rel="stylesheet" href="${fontsHref}">` : ""}
<style>
@page { size: ${page.width}mm ${page.height}mm; margin: 0; }
html, body { margin: 0; padding: 0; }
${stylesheet}
</style>
</head>
<body>
${markup}
${options.autoPrint ? "<script>window.addEventListener('load', function () { setTimeout(function () { window.print(); }, 350); });<\/script>" : ""}
</body>
</html>
`;
}
