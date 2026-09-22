# Portfolio Builder

A portfolio site builder with full customisation — templates, themes, sections, typography and layout — aimed at any
profession, not just developers. Everything runs in the browser; there is no backend, no account and no upload.

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## What it does

- **21 section types** — hero, about, experience, education, projects, skills, services, gallery, testimonials,
  publications, certifications, awards, stats, writing, pricing, FAQ, languages, clients, contact, call-to-action and a
  free-form custom block. Each has several layout variants and its own options.
- **10 templates** — minimal, classic, sidebar, tabbed, magazine, terminal, canvas, timeline, bento and one-page.
  Templates control layout and navigation only.
- **14 colour presets + full palette control** — every palette value, font, radius, shadow, spacing step and backdrop is
  editable, with a live WCAG AA contrast check on custom colours.
- **40 fonts** and 12 curated heading/body pairings.
- **27 profession presets** — developer, designer, photographer, writer, academic, doctor, lawyer, consultant, student,
  marketer, musician, chef, architect, teacher, data scientist, product manager, freelancer, security engineer,
  accountant, chartered accountant, financial analyst, HR, sales, civil engineer, nurse, operations, blank.
  Each one brings its own sample content, not just a layout: an accountant starts with statutory audits, IND-AS and
  ICAI qualifications, a surgeon with clinical appointments, a photographer with shoot packages.
- **Résumé builder** — 6 templates (classic, modern, compact, elegant, technical, creative), A4 or US Letter, margin,
  density, type and accent control, and a two-column layout you can move sections between. Exports as PDF via print, or
  as standalone HTML.
- **Résumé import** — read an existing PDF, DOCX or text résumé and fill in your details, roles, education, skills and
  certifications.
- **Guided builder** — answer six short questions and get a filled-in portfolio and résumé, with skills, tools and
  achievement phrasings offered as multiple choice for your field.
- **Publish** — a deploy-ready `.zip` plus step-by-step guides for Netlify Drop, Cloudflare Pages, GitHub Pages and
  Vercel.
- **Live preview in a real iframe**, so the mobile and tablet previews resolve the actual CSS breakpoints.
- **Zoom that widens the viewport**, not just the picture: at 60% the canvas lays out at a larger viewport and
  renders scaled down, so what you see is the layout that viewport really gets rather than a smaller picture of
  the same breakpoint.
- **Drag to reorder** sections, entries within a section, and skills within a group — each list is
  independent, so a skill can never be dropped into the wrong group. Up/down buttons remain beside every
  row as the keyboard and touch path.
- **Undo/redo**, autosave, multiple projects, JSON import/export.
- **Standalone HTML export** — one self-contained file you can host anywhere.
- **Share links** that carry the whole portfolio compressed in the URL fragment.

## Architecture

The central idea is that a portfolio is **one JSON document** (`PortfolioDoc`), and everything else is a pure function
of it.

```
src/
  lib/
    types.ts        The PortfolioDoc schema — the single source of truth
    sections.ts     Section registry: variants, item fields, options, sample content
    templates.ts    Template registry (layout + navigation only)
    themes.ts       Colour presets
    fonts.ts        Font catalogue and Google Fonts URL builder
    presets.ts      Profession starting points
    samples.ts      Sample content per profession — what fills those sections
    theme-css.ts    Theme → CSS custom properties
    defaults.ts     Document creation and normalisation of imported files
    store.tsx       Builder state: mutations, undo/redo, autosave, portfolio/résumé mode
    resume.ts       Résumé templates, page sizes, column defaults
    import-resume.ts  PDF/DOCX text extraction and heuristic parsing
    apply-parsed.ts   Writes parsed résumé data into a document
    guided.ts       Curated per-role skills, strengths and achievement phrasings
    storage.ts      localStorage persistence (an external store)
    share.ts        gzip + base64url share links
    export-html.tsx Standalone HTML generation
  renderer/         Pure, hook-free components that draw a PortfolioDoc
  components/       The builder UI (Tailwind)
    builder/
      Canvas.tsx           The preview, framed on the canvas — zoom and device widths
      PortfolioPreview.tsx One live preview; used by both the canvas and the pane
      ResumePreview.tsx    The paged résumé sheet
    ui/
      useSortable.ts       Drag-to-reorder, shared by the section and entry lists
public/
  portfolio.css   The portfolio stylesheet
  resume.css      The résumé stylesheet (mm and pt — it is a printed document first)
  pdf.worker.min.mjs  Vendored by postinstall so import always matches the installed pdf.js
```

Three decisions do most of the work:

**Themes are CSS custom properties.** `theme-css.ts` turns a `Theme` into `--pf-*` variables, and `portfolio.css` reads
nothing else. That is why any theme composes with any template, and why switching either one never touches content.

**The renderer is pure and hook-free.** The same components render the live preview, the `/view` page and the HTML
export. Behaviour that markup alone cannot provide — tab switching, the FAQ accordion, reveal-on-scroll, count-up stats,
the colour-scheme toggle — lives in `renderer/runtime.ts` as one vanilla-JS string injected into all three. The preview
therefore behaves exactly like the exported file.

**`portfolio.css` is a plain stylesheet, not Tailwind.** It is loaded by the preview iframe, linked by `/view`, and
inlined verbatim into exports. A build step in that path would make a self-contained export impossible. Tailwind is used
for the builder chrome only.

## One document, two outputs

The résumé is not a separate project. It reads the same `sections` as the portfolio — the same jobs, the same skills —
and only layers its own order, page setup and styling on top via `doc.resume`. Edit a job once and it changes in both.
The top bar switches which one you are looking at, and the editor panels follow.

`resume.css` is sized in millimetres and points rather than pixels, because a résumé is a printed document first.
Sizing it in px and hoping the print scale works out is how you get a CV that looks right on screen and wrong on paper.

The preview **paginates the way print will**. On screen the sheet is one continuous column, so without help it happily
draws a heading straight through a page break that print would never produce. The preview measures every block and
pushes the ones that would straddle a boundary onto the next page — the same thing `break-inside: avoid` does when the
document is really paginated — so the guide lines mark where the page actually turns. A section is allowed to break
(one with eight roles is taller than a page, and `avoid` on the whole thing is simply ignored); it is the entries that
stay intact, and a heading is measured together with what follows so it is never left stranded.

Two-column templates paginate **per column**. The browser fragments the grid row, so the sidebar and the main column
carry on independently down the next page: a certification pushed in the sidebar must not move a role in the main
column. Each column is walked separately while the page boundaries stay in shared sheet coordinates, because both
columns sit on the same sheet of paper.

Getting the measurement right once is not enough, which is what made breaks land mid-bullet long after this was
written. It ran on a timer keyed on the résumé settings and the section item counts, and missed the two things that
move the layout most: **web fonts**, which arrive after the first paint and reflow every block, and **editing the
text inside an entry**, which changes its height without changing any count. The old offsets stayed where they were
and the guides drifted away from the content.

It now re-runs on `document.fonts.ready` and on a `MutationObserver` watching the sheet for content changes,
debounced so a burst of keystrokes costs one pass. The observer watches `childList` and `characterData` only — the
inline margins the pass writes are attribute mutations, so it cannot feed itself. The debounce is a timer rather
than an animation frame on purpose: a backgrounded tab is served no frames, and the preview would sit on a stale
layout until someone looked at it again.

Finally, print and preview now agree on what may not be broken. `.rs-entry` carried `break-inside: avoid`, but the
summary, skill groups, meters and the sidebar contact block did not — the preview moved them and the printed PDF
split them anyway.

## One specificity bug, every component

`.pf-root a { color: inherit }` exists to kill the browser's link colour. It is also more specific than `.pf-btn`,
`.pf-social` or `.pf-project-link` — one class plus one type beats one class — so every anchor-shaped component was
quietly inheriting the body text colour instead of the one it asked for. A primary button came out with near-black
text on a mid-dark fill, socials lost their muted grey, project links lost the accent.

It hid for as long as it did because on a dark theme the inherited colour is near-white, which looks plausible on a
coloured button. Light themes made it obvious.

The button reset next to it was worse, because it strips three properties rather than one: `.pf-root button`
declares `color: inherit`, `border: none` and `background: none`, and it outranks the components in exactly the same
way. The floating theme toggle lost its surface and its border and became an unlabelled icon floating on the page;
the tabbed template's inactive tabs lost their muted colour; and the contact form's submit button — the one
`<button>` styled as a primary button — rendered as bare text with no fill at all.

Both resets are now written `:where(a)` and `:where(button)`. `:where()` contributes no specificity, so they still
beat the user agent and lose to any component that names a colour of its own. The résumé sheet had the same link
reset and got the same change.

The check that found them compares what each rule *declares* against what the element actually *computes*, which is
the only way to catch this class of bug: a contrast audit sees nothing wrong, because inheriting the body text
colour is perfectly readable — it is just not the colour the component asked for. Across all ten templates, every
`.pf-*` rule that names a colour, background or border now resolves to the value it declares.

## The résumé stops pretending to be paper on a phone

Everything about the résumé is sized in millimetres and points so that it prints correctly, and `resume.css` had no
screen breakpoint at all. Handed to a phone that is a 210mm sheet in a 375px window: a postage stamp and a
horizontal scrollbar. Scaling it to fit is no better — an A4 page in a 375px column puts the type at 44%, which is
legible in the sense that the pixels are there and unreadable in every sense that matters.

Below 780px the sheet becomes a document instead: full width, one column, type with a floor in pixels, page guides
off. The breakpoint sits below the paper itself (A4 is 794px, US Letter 816px) so the builder's preview frame, which
is rendered at the true page width, keeps the paper layout. `@media screen` keeps print on the millimetres.

The builder's preview does the same thing rather than scaling: when the canvas is narrower than the paper it renders
the frame at the width it actually has, which puts the résumé under its own small-screen rules and makes the preview
an honest picture of what the exported file gives a phone. Pagination is skipped there, because a fluid column has
no page boundaries to push blocks across.

Two template-specific traps came out of testing all six at 375px. The creative template puts its sidebar on the
right through a selector one step more specific, so the stacking rule had to name it or it kept two columns. And its
banner header bleeds to the paper edge with a negative margin of one page margin — 16mm, or 60px — which against a
phone's 18px padding hung 42px off each side; the mobile padding is a variable now and the bleed undoes exactly it.

## Phones get their own layout, not a squeezed one

Two things were wrong on a phone, and neither showed up as an overflow.

**In the portfolio**, the sidebar and timeline templates put their rail above the content from 1080px down
(430px of it on a tablet, more than half the first screen on a phone) — an avatar, a name, a headline, a badge, a button and a row of socials, 455px of it, more than half the
first screen, every item of which the hero repeats immediately below. It is now a 109px sticky header: who this is,
and one scrolling line of links. The split hero also explicitly ordered its portrait above the copy on narrow
screens, so the name sat below the fold beneath a 220px monogram; the copy comes first now. Touch targets are 44px
(they were 38), the smallest type has an 11.5px floor (it was 10), and section padding is capped at 52px, which
takes about a screen and a half out of a seven-section page.

**In the builder**, the rail and the panel alone come to 400px, so below 1024px the canvas was squeezed to two
pixels — you were editing blind. Narrow screens now show one pane at a time with a Preview/Edit toggle, the panel
fills the width, and the toolbar keeps only what a phone has room for: the project, the two outputs, and the way
out to the finished site.

## Portfolios are full width

Every fixed content width was a compromise with one particular screen. 1040px looked generous on a laptop and left
430px of empty page down each side of a 1920px display; widening it to 1240px moved the number without answering
the question. The layout is fluid now — full width is the default, and the side padding scales with the viewport
(`clamp(18px, 4.5vw, 96px)`) so edge-to-edge still breathes on a large monitor and does not crowd the text on a
phone.

Line length is handled where it belongs: prose blocks carry their own `max-width` in `ch`, so paragraphs stay
readable no matter how wide the shell around them is. The fixed widths remain as options — 1100, 1440 and 1800 —
for the layout that genuinely wants one: Minimal, whose whole description is a single centred column, keeps its
1100px. Every other template runs edge to edge, Sidebar and Timeline filling everything beside their nav rail.

Documents saved before this change are moved onto the full-width layout once, gated on the schema version so it
happens exactly once and never overrides someone who deliberately chose the reading column.

## The shell gets out of the way

The preview sits on the canvas like a sheet on a desk — inset, hairline border, soft shadow. Running it to all
four edges meant a dark portfolio met the white shell along a hard line and the two read as one broken screen
instead of an editor and the thing being edited. The frame works for any palette, which matters because the
palette is the user's choice; the two generic starting points, developer and blank, now start light so a fresh
project is coherent from the first frame, while presets with a deliberate character — a photographer's noir, a
security engineer's matrix — keep it.

The builder chrome is white and almost colourless on purpose: the only saturated thing on screen should be the
portfolio being built. Surfaces are separated by a hairline rather than by shade, and the single accent is used for
what is selected, what is focused, and the primary action — nothing else.

Every colour is a token in `app/globals.css`, so the palette is one block of CSS rather than a value repeated across
components. They are chosen against white for WCAG AA: body text 16:1, secondary 7:1, the faintest label 4.8:1, and
the status colours re-mixed because a mint and amber tuned for a near-black background read as pastel on paper. A
contrast sweep over every panel reports no text below its threshold.

`:focus-visible` draws one ring for the whole shell. Only inputs had one before, so tabbing through the rail, the
panels and the toolbar was invisible — the controls are custom-styled, and the browser default all but disappears on
white. The toolbar also sheds its conveniences as it narrows: device widths below 1024px, zoom below 768px, labels
before icons — so Preview, the button that opens the finished site, is never the thing pushed off the edge.

## Projects are created once, not once per reload

`/builder?preset=accountant` is an instruction: start a project from this preset. It used to be re-read on every
load, so refreshing the page while trying a preset out quietly started another project each time — try three presets,
reload a few times, and the list fills with identical cards. The query is now consumed: the effect that creates the
project also replaces the history entry with plain `/builder`, so a reload resumes what was created rather than
repeating it.

The landing page list collapses past six entries and offers **Clear all**, which asks first and says how many are
about to go. Clearing removes the stored documents as well as the summaries — orphaned documents would keep occupying
the storage quota with nothing pointing at them.

## Why presets carry their own copy

A preset that only picked a template and a palette left everyone starting from the same sample document — so an
accountant who chose the accountant preset was handed "Senior Product Engineer at Northwind Labs", three bullet
points about rendering pipelines and a row of TypeScript tags. Placeholder text is meant to show what a section is
for; copy from the wrong profession shows what it is not.

`lib/samples.ts` holds a pack per profession family, and `createSection` prefers it over the generic sample. Packs
are keyed by family rather than by preset because an accountant, a CA and a financial analyst share a vocabulary,
with overrides where one genuinely differs — a CA qualifies through the ICAI, an analyst builds models rather than
auditing them. Sections where a profession has nothing particular to say, like FAQ or pricing, keep the generic copy
on purpose.

## What the résumé importer can and cannot do

Extraction does the heavy lifting, because most real résumés are two-column and a PDF stores text as positioned runs
with no notion of columns or even lines. Reading one naively interleaves the sidebar with the body and produces
nonsense — which is why the importer:

- **finds the column gutter** from a coverage histogram across the page, tolerating the odd long line that overhangs
  it, and reads each column top to bottom in turn;
- **keeps font size, weight and indentation** per line, and identifies headings from those rather than from keywords
  alone, so an unfamiliar section title still ends the section above it;
- **recognises bullets by indentation** as well as by glyph, since PDFs draw bullets from whatever font the author
  used and extraction can turn one into an arbitrary character.

Parsing then identifies sections by **scoring keywords anywhere in the heading** rather than matching a prefix. A
prefix rule only ever recognises the exact wording it was taught — "PROJECTS" matched but "KEY PROJECTS" and "PROJECT
EXPERIENCE" did not, and "ACADEMIC PROJECTS" matched *education*. Each keyword carries a weight so the most specific
word decides: "project" outweighs "academic", and "experience" loses to "project" in "PROJECT EXPERIENCE" but wins in
"WORK EXPERIENCE". The review screen lists the headings it recognised, so a section it missed is visible rather than
silently absent.

Entries then pick up the shapes résumés actually use: a `Tech:` / `Stack:` / `Tools:` line becomes tags, a line that
is only a link becomes the entry's link, a trailing year becomes the period, and a full sentence is treated as the
description rather than promoted to an entry of its own. Crucially an **undated list still splits** — most projects
sections have no dates at all, and requiring one meant every project after the first was swallowed into the first
one's description.

An unfamiliar heading still closes the section above it, but that guess now needs corroboration: it cannot follow
another heading, cannot be a short acronym, and where font sizes are known it has to be set like the headings the
parser already confirmed. Without those guards a project called "LIA" reads as a section heading and hijacks
everything below it.

Two more distinctions cost a whole section each when they were missing. A line naming a **qualification or a role is
never a heading**: "Bachelor of Technology" contains *Technology*, scores as a Skills heading and, being three words
long, used to need no other evidence — which filed an entire Education block under Skills. And a **place with no
comma** — "Karnataka", "Remote" — is shaped exactly like an entry title, so it is only read as a location inside an
experience or education entry that already has both a title and an organisation and is still missing one. In a
projects list the same shape is the next project, which is why the block decides rather than the line.

Position settles the rest. The line directly under a role or a degree is the **organisation**, never a place — "Infosys,
Pune" is Infosys in Pune, not a town called Infosys — so it is split into the two, and only the line *after* an entry
already names its organisation can be a location. That one rule fixes the three shapes that used to break: "Software
Engineer, Leapsurge" followed by "Bengaluru" (which became an entry of its own), "Senior Analyst" over "Infosys, Pune"
(which lost the employer), and "Systems Engineer - Platform Team" over "Acme Corp" (which lost both).

A résumé that states no location in its header is left with none. The first place-shaped line further down belongs to
a job, and an old employer city is not where someone lives.
The same care applies within a line. "Assistant Manager - Audit" is one job title, not a role at a company called
Audit, so a hyphen or comma does not split off a **business function**; but "Role | Company | City, Country" does give
up its city, which otherwise stays glued to the company. Under a degree that already names its school, a plain line is
a **detail of it** — the field, the grade, the thesis — rather than the next qualification.
Two things an import used to carry into the finished page, both now handled wherever they occur rather than for one
file.

**Links.** A résumé header usually lists a personal site and often an employer's, alongside the real profiles. Every
one of them became a social icon, the personal site appeared twice — once as the website, once as a link — and the
placeholder socials a new document ships with stayed behind pointing at `x.com/yourname`. Only recognised profiles
become social links now; anything generic is already shown as the website. Links are compared with the scheme, the
`www.` and the trailing slash removed, so one address cannot be listed twice, and any placeholder left unfilled at
the end of an import is dropped — a finished page that sends a visitor to an account which does not exist is worse
than one icon fewer.

**Spoken languages.** Plenty of résumés end their skills list with "English, Hindi, Tamil" rather than giving them a
heading, and a skills section that trails off into four languages reads as though they were frameworks. They are
moved into the languages section whether or not the file had a heading for them. The list is natural languages only:
Go and R are deliberately absent, because they name languages of quite another kind.

That is still pattern matching, not comprehension. Résumés have no schema, so:

- It tells you how confident it is, and warns when a file looks heavily formatted or multi-column.
- It shows everything it found for review, item by item, before anything is applied.
- It never silently drops lines it could not place — it reports the count.
- Applying is one undo step.

Nothing is uploaded; extraction and parsing both run in your browser.

## What the guided builder is

A curated lookup, not a language model. `lib/guided.ts` holds the skills, tools, strengths and achievement phrasings
that recur in each role family, and the wizard offers them as multiple choice. It assembles what you pick and fills in
a summary sentence.

It will not invent work you did not do. Achievement options are templates with a `…` where your number goes, left for
you to fill in. If you want real generated prose, that needs a model behind it — this ships without one so it works
offline and with no key.

## Hosting

This builder has no server, so it cannot host anything itself. The Publish panel produces a folder — `index.html`,
`resume.html`, a readme — that every static host serves unchanged, and walks through the free options. Netlify Drop and
Cloudflare Pages both accept a drag-and-drop upload and give you a live URL without an account. Because the output is
plain HTML, moving between hosts later costs nothing.

## The section registry

Adding a section type means adding one entry to `SECTION_DEFS` in `lib/sections.ts` and one renderer. The registry
declares the layout variants, which item fields are meaningful, the per-section options and a sample factory — and the
editor builds itself from that. No panel code needs touching.

## Data and privacy

Projects are saved to `localStorage` under `pb:*` keys. Share links put the whole document, gzipped and base64url
encoded, in the URL **fragment**, which browsers never send to a server. Uploaded images are inlined as data URIs
(downscaled to 1400px, capped at 600 KB) so a portfolio stays one portable file; for anything larger, host the image and
paste its URL.

Browsers allow roughly 5 MB of localStorage. The Export panel shows current usage, and the save indicator turns to
"Not saved" if a write is rejected.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + S` | Save now |
| `Ctrl/Cmd + \` | Toggle focus mode |

## Publishing an exported portfolio

`Export → Download standalone HTML` gives you a single file. Rename it `index.html` and drop it on Netlify, Vercel,
GitHub Pages, Cloudflare Pages, S3 or any static host. It needs no build step and no dependencies; the only network
request is the Google Fonts stylesheet, and the page falls back to system fonts without it.

The contact form posts to whatever endpoint you set in the Contact section's options (Formspree, Getform, Basin and
similar all work). Left empty, it opens the visitor's email client instead.
