"use client";

import { unzipSync, strFromU8 } from "fflate";
import type { Item } from "./types";
import { toTags, uid } from "./utils";

/**
 * Résumé import.
 *
 * Two stages, kept separate on purpose:
 *
 * 1. **Extraction** turns a PDF or DOCX into lines that carry a little styling —
 *    font size, boldness, the gap above them.
 * 2. **Parsing** turns those lines into structured entries.
 *
 * The styling matters more than it sounds. Most real résumés are two-column, and
 * a PDF stores text as positioned runs with no notion of columns or even lines —
 * so reading it naively interleaves the sidebar with the body and produces
 * nonsense. Detecting the gutter and reading each column separately is what makes
 * real files parse at all. Font size then identifies headings far more reliably
 * than keyword matching, which only ever recognises the wording it was taught.
 *
 * Parsing is still guesswork, and says so: résumés have no schema. Everything is
 * shown for review before it touches the document, and `confidence` tells the UI
 * how loudly to hedge.
 */

/** A line of extracted text plus the few style signals worth keeping. */
export interface DocLine {
  text: string;
  /** Font size in points; 0 when unknown (plain text input). */
  size: number;
  bold: boolean;
  /** Vertical gap above this line, in points. Paragraph breaks show up here. */
  gapBefore: number;
  /** 0 for a single-column page, or the column index on a split page. */
  column: number;
  /** Left offset from the column's own margin, in points. */
  indent: number;
}

function line(text: string, extra: Partial<DocLine> = {}): DocLine {
  return { text, size: 0, bold: false, gapBefore: 0, column: 0, indent: 0, ...extra };
}

/* ───────────────────────────── PDF extraction ───────────────────────────── */

interface Run {
  str: string;
  x: number;
  right: number;
  y: number;
  size: number;
}

/**
 * Find the vertical gutter separating two columns, if there is one.
 *
 * Walks a coverage histogram across the page width looking for a band almost no
 * text crosses. "Almost" is the important part: requiring a completely empty
 * band fails on nearly every real résumé, because one long line in the narrow
 * column — a certification name, a long URL — overhangs into the gutter and
 * closes it. A couple of stragglers are tolerated instead.
 *
 * Only the middle of the page is considered; margins are empty too, and are not
 * gutters.
 */
function findGutter(runs: Run[], pageWidth: number): { start: number; end: number } | null {
  if (runs.length < 20) return null;

  const BUCKETS = 100;
  const covered = new Array<number>(BUCKETS).fill(0);
  for (const run of runs) {
    const from = Math.max(0, Math.floor((run.x / pageWidth) * BUCKETS));
    const to = Math.min(BUCKETS - 1, Math.ceil((run.right / pageWidth) * BUCKETS));
    for (let i = from; i <= to; i += 1) covered[i] += 1;
  }

  const noiseLimit = Math.max(1, Math.floor(runs.length * 0.04));
  const from = Math.floor(BUCKETS * 0.18);
  const to = Math.floor(BUCKETS * 0.82);

  // Longest low-coverage band, at least 3% of the page wide.
  let best: { start: number; end: number } | null = null;
  let start = -1;
  for (let i = from; i <= to + 1; i += 1) {
    const quiet = i <= to && covered[i] <= noiseLimit;
    if (quiet) {
      if (start === -1) start = i;
    } else if (start !== -1) {
      if (i - start >= 3 && (!best || i - start > best.end - best.start)) best = { start, end: i };
      start = -1;
    }
  }
  if (!best) return null;

  const gutter = {
    start: (best.start / BUCKETS) * pageWidth,
    end: (best.end / BUCKETS) * pageWidth,
  };

  // Both sides must carry real content, or this is just a ragged right margin.
  const mid = (gutter.start + gutter.end) / 2;
  const left = runs.filter((r) => (r.x + r.right) / 2 < mid).length;
  if (left / runs.length < 0.15 || (runs.length - left) / runs.length < 0.15) return null;
  return gutter;
}

/**
 * Which column a run belongs to.
 *
 * A run that starts left of the gutter and ends right of it spans the page — a
 * header, or a rule — so it joins the first column rather than being torn in
 * half. Everything else goes by its midpoint, which keeps a line that merely
 * overhangs the gutter with the column it was set in.
 */
function columnOf(run: Run, gutter: { start: number; end: number }): number {
  if (run.x < gutter.start && run.right > gutter.end) return 0;
  return (run.x + run.right) / 2 < (gutter.start + gutter.end) / 2 ? 0 : 1;
}

/** Group runs into visual lines, then sort them into reading order. */
function runsToLines(runs: Run[], column: number): DocLine[] {
  if (runs.length === 0) return [];

  const sizes = runs.map((r) => r.size).sort((a, b) => a - b);
  const medianSize = sizes[Math.floor(sizes.length / 2)] || 10;
  const tolerance = Math.max(1.5, medianSize * 0.45);

  const rows: { y: number; runs: Run[] }[] = [];
  for (const run of [...runs].sort((a, b) => b.y - a.y)) {
    const row = rows[rows.length - 1];
    if (row && Math.abs(row.y - run.y) <= tolerance) row.runs.push(run);
    else rows.push({ y: run.y, runs: [run] });
  }

  const columnLeft = Math.min(...runs.map((r) => r.x));
  const lines: DocLine[] = [];
  let previousY: number | null = null;
  for (const row of rows) {
    const ordered = row.runs.sort((a, b) => a.x - b.x);
    const text = ordered
      .map((r) => r.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) continue;

    const size = Math.max(...ordered.map((r) => r.size));
    const gapBefore = previousY === null ? 0 : Math.max(0, previousY - row.y - size);
    previousY = row.y;
    lines.push({ text, size, bold: false, gapBefore, column, indent: ordered[0].x - columnLeft });
  }
  return lines;
}

async function extractPdf(file: File): Promise<DocLine[]> {
  const pdfjs = await import("pdfjs-dist");
  // The worker is vendored into `public/` by a postinstall step so it is always
  // the exact build this version of pdfjs expects.
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjs.getDocument({ data });
  const pdf = await task.promise;
  const out: DocLine[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();

      const runs: Run[] = [];
      for (const entry of content.items) {
        if (!("str" in entry) || !entry.str.trim()) continue;
        const transform = entry.transform as number[];
        // The transform's scale component is the rendered font size; `height`
        // is unreliable for rotated or scaled text.
        const size = Math.hypot(transform[2], transform[3]) || entry.height || 10;
        const x = transform[4];
        runs.push({ str: entry.str, x, right: x + (entry.width || 0), y: transform[5], size });
      }
      if (runs.length === 0) {
        await page.cleanup();
        continue;
      }

      const gutter = findGutter(runs, viewport.width);
      if (gutter === null) {
        out.push(...runsToLines(runs, 0));
      } else {
        // Read each column top to bottom in turn. Reading across the page would
        // interleave the sidebar with the body and destroy the structure.
        out.push(...runsToLines(runs.filter((r) => columnOf(r, gutter) === 0), 0));
        out.push(...runsToLines(runs.filter((r) => columnOf(r, gutter) === 1), 1));
      }
      await page.cleanup();
    }
  } finally {
    // Releasing the worker matters: several imports in a session would otherwise
    // leave one alive per file.
    await task.destroy();
  }

  return out;
}

/* ───────────────────────────── DOCX extraction ───────────────────────────── */

function decodeXml(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function extractDocx(file: File): Promise<DocLine[]> {
  const zip = unzipSync(new Uint8Array(await file.arrayBuffer()));
  const entry = zip["word/document.xml"];
  if (!entry) throw new Error("That does not look like a Word document — word/document.xml is missing.");

  const xml = strFromU8(entry);
  const lines: DocLine[] = [];

  // Each <w:p> is a paragraph; <w:t> holds the text runs inside it. Table cells
  // contain paragraphs too, so this picks them up without special handling.
  for (const paragraph of xml.split(/<w:p[ >]/).slice(1)) {
    const text = decodeXml([...paragraph.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map((m) => m[1]).join(""));
    if (!text) continue;

    // Word records these directly, so DOCX gives better style signal than PDF.
    const bold = /<w:b\s*\/>|<w:b\s+w:val="(?:1|true|on)"/.test(paragraph);
    const styled = /<w:pStyle[^>]*w:val="(?:Heading|Title|Subtitle)/i.test(paragraph);
    const halfPoints = paragraph.match(/<w:sz\s+w:val="(\d+)"/)?.[1];
    const size = halfPoints ? Number(halfPoints) / 2 : 0;
    const isList = paragraph.includes("<w:numPr");
    const twips = Number(paragraph.match(/<w:ind[^>]*w:left="(\d+)"/)?.[1] ?? 0);

    lines.push(line(text, { bold: bold || styled, size, indent: isList ? Math.max(18, twips / 20) : twips / 20 }));
  }

  if (lines.length === 0) throw new Error("No readable text found in that document.");
  return lines;
}

export async function extractLines(file: File): Promise<DocLine[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") return extractPdf(file);
  if (name.endsWith(".docx")) return extractDocx(file);
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
    return (await file.text())
      .split(/\r?\n/)
      .map((text) => line(text.trim()))
      .filter((l) => l.text);
  }
  if (name.endsWith(".doc")) {
    throw new Error("Legacy .doc files are not supported. Save it as .docx or PDF and try again.");
  }
  throw new Error("Unsupported file. Upload a PDF, DOCX or plain text résumé.");
}

/* ───────────────────────────── Parsing ───────────────────────────── */

export interface ParsedResume {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  links: string[];
  summary: string;
  experience: Item[];
  education: Item[];
  skills: string[];
  certifications: Item[];
  projects: Item[];
  awards: Item[];
  languages: string[];
  /** How much of the structure the parser is confident about. */
  confidence: "high" | "medium" | "low";
  /** Headings it recognised, for the review screen. */
  headings: string[];
  /** Lines it could not place, so nothing is silently dropped. */
  unparsed: string[];
}

type BlockKey =
  | "header"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "certifications"
  | "projects"
  | "awards"
  | "languages"
  | "other";

/**
 * Heading patterns, matched on the stem rather than the whole word.
 *
 * `\b` after a full word never matches its plural — "certification\b" fails on
 * "CERTIFICATIONS", because n→S is not a word boundary.
 */
/**
 * Heading keywords, scored rather than prefix-matched.
 *
 * Anchoring a pattern to the start of the line only ever recognises the exact
 * wording it was taught: "PROJECTS" matched, but "KEY PROJECTS", "ACADEMIC
 * PROJECTS" and "PROJECT EXPERIENCE" did not — and "ACADEMIC PROJECTS" matched
 * *education*, filing someone's projects under their degree.
 *
 * Instead every keyword is searched anywhere in the line and carries a weight,
 * so the most specific word decides. "project" outweighs "academic", and
 * "experience" loses to "project" in "PROJECT EXPERIENCE" but wins in "WORK
 * EXPERIENCE" where no stronger keyword appears. Ties go to whichever keyword
 * comes first, which matches how people read a compound heading.
 */
const HEADING_KEYWORDS: { key: BlockKey; pattern: RegExp; weight: number }[] = [
  { key: "summary", pattern: /\bsummar(y|ies)\b/i, weight: 10 },
  { key: "summary", pattern: /\bobjectives?\b/i, weight: 10 },
  { key: "summary", pattern: /\bintroduction\b/i, weight: 9 },
  { key: "summary", pattern: /\bprofile\b/i, weight: 9 },
  { key: "summary", pattern: /\bover ?view\b/i, weight: 8 },
  { key: "summary", pattern: /\babout(\s+me)?\b/i, weight: 8 },

  { key: "experience", pattern: /\bemployment\b/i, weight: 10 },
  { key: "experience", pattern: /\b(work|career)\s+history\b/i, weight: 10 },
  { key: "experience", pattern: /\bpositions?\s+held\b/i, weight: 10 },
  { key: "experience", pattern: /\binternships?\b/i, weight: 8 },
  { key: "experience", pattern: /\bexperience\b/i, weight: 6 },

  { key: "education", pattern: /\beducation(al)?\b/i, weight: 10 },
  { key: "education", pattern: /\bqualifications?\b/i, weight: 10 },
  { key: "education", pattern: /\bscholastic\b/i, weight: 10 },
  { key: "education", pattern: /\bschooling\b/i, weight: 10 },
  { key: "education", pattern: /\bdegrees?\b/i, weight: 8 },
  { key: "education", pattern: /\bacademics?\b/i, weight: 3 },

  { key: "skills", pattern: /\bskills?\b/i, weight: 10 },
  { key: "skills", pattern: /\bcompetenc(y|ies|e|es)\b/i, weight: 10 },
  { key: "skills", pattern: /\bexpertise\b/i, weight: 10 },
  { key: "skills", pattern: /\bproficienc(y|ies)\b/i, weight: 10 },
  { key: "skills", pattern: /\b(tech\s*stack|toolkit)\b/i, weight: 10 },
  { key: "skills", pattern: /\btechnolog(y|ies)\b/i, weight: 9 },
  { key: "skills", pattern: /\btools?\b/i, weight: 7 },

  { key: "projects", pattern: /\bprojects?\b/i, weight: 10 },
  { key: "projects", pattern: /\bportfolio\b/i, weight: 10 },
  { key: "projects", pattern: /\bcase\s+stud(y|ies)\b/i, weight: 10 },
  { key: "projects", pattern: /\bassignments?\b/i, weight: 8 },

  { key: "certifications", pattern: /\bcertificat(e|es|ion|ions)\b/i, weight: 10 },
  { key: "certifications", pattern: /\blicen[cs](e|es|ure)\b/i, weight: 10 },
  { key: "certifications", pattern: /\baccreditations?\b/i, weight: 10 },
  { key: "certifications", pattern: /\bcredentials?\b/i, weight: 10 },
  { key: "certifications", pattern: /\b(courses?|trainings?|workshops?)\b/i, weight: 7 },

  { key: "awards", pattern: /\bawards?\b/i, weight: 10 },
  { key: "awards", pattern: /\bhonou?rs?\b/i, weight: 10 },
  { key: "awards", pattern: /\bpublications?\b/i, weight: 10 },
  { key: "awards", pattern: /\bpatents?\b/i, weight: 10 },
  { key: "awards", pattern: /\brecognitions?\b/i, weight: 9 },
  { key: "awards", pattern: /\bextra.?curricular\b/i, weight: 9 },
  { key: "awards", pattern: /\b(achievements?|accomplishments?)\b/i, weight: 7 },
  { key: "awards", pattern: /\bpapers?\b/i, weight: 7 },
  { key: "awards", pattern: /\bactivities\b/i, weight: 5 },

  { key: "languages", pattern: /\blanguages?\b/i, weight: 10 },
  { key: "languages", pattern: /\blinguistic\b/i, weight: 10 },

  { key: "other", pattern: /\bcontact\b/i, weight: 10 },
  { key: "other", pattern: /\bhobb(y|ies)\b/i, weight: 10 },
  { key: "other", pattern: /\breferences?\b/i, weight: 10 },
  { key: "other", pattern: /\bdeclaration\b/i, weight: 10 },
  { key: "other", pattern: /\bpersonal\s+details?\b/i, weight: 10 },
  { key: "other", pattern: /\b(get\s+in\s+touch|find\s+me)\b/i, weight: 10 },
  { key: "other", pattern: /\bmemberships?\b/i, weight: 9 },
  { key: "other", pattern: /\binterests?\b/i, weight: 9 },
  { key: "other", pattern: /\bvolunteer/i, weight: 8 },
];

/** The best-scoring section for a heading line, or null if nothing matches. */
function scoreHeading(text: string): BlockKey | null {
  let best: { key: BlockKey; weight: number; index: number } | null = null;
  for (const { key, pattern, weight } of HEADING_KEYWORDS) {
    const index = text.search(pattern);
    if (index === -1) continue;
    if (!best || weight > best.weight || (weight === best.weight && index < best.index)) {
      best = { key, weight, index };
    }
  }
  return best?.key ?? null;
}

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE = /(\+?\d[\d\s().-]{7,}\d)/;
// Labels must be two characters or more, so abbreviations like "B.Com" and
// "M.Sc" are not collected as websites.
const URL_SOURCE =
  "((https?://|www\\.)[^\\s,;|]+|(?:[\\w-]{2,}\\.)+(?:com|org|net|io|dev|me|co|in|ai|uk|edu|xyz)(?:/[^\\s,;|]*)?)";

/** Date ranges, covering the shapes résumés actually use. */
const MONTH = "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?";
const DATE = `(?:${MONTH}\\s*)?(?:\\d{1,2}[/.\\-])?(?:\\d{4}|'\\d{2})`;
const PERIOD = new RegExp(
  `(?:since\\s+)?${DATE}\\s*(?:[-–—]|to|until|till)\\s*(?:${DATE}|present|current|now|date|ongoing)`,
  "i",
);
/** A line that is only a link, optionally behind a "Repo:" style label. */
const LINK_ONLY = new RegExp(`^(?:link|url|repo|demo|github|live)?\\s*[:–—-]?\\s*${URL_SOURCE}$`, "i");

const SINGLE_YEAR = /\b(19|20)\d{2}\b/;
/** A line that is only a date or date range, with no other words on it. */
const DATE_ONLY = new RegExp(
  `^[(\\[]?\\s*(?:${DATE}|present|current)(?:\\s*(?:[-–—]|to|until|till)\\s*(?:${DATE}|present|current|now|date|ongoing))?\\s*[)\\]]?$`,
  "i",
);
const BULLET = /^[•·▪◦‣*•●▪·‣⁃>\-–—]\s+/;

function isAllCaps(text: string): boolean {
  const letters = text.replace(/[^A-Za-z]/g, "");
  return letters.length >= 3 && letters === letters.toUpperCase();
}

/**
 * Decide whether a line is a section heading, and which section it names.
 *
 * Style comes first: a short line that is bold, uppercase or noticeably larger
 * than the body is a heading whatever it says. That is what lets an unrecognised
 * wording still *end* the previous section instead of being swallowed by it.
 */
/** What the parser has learned about this document's headings so far. */
interface HeadingContext {
  bodySize: number;
  /** True once a keyword-matched heading has been seen. */
  afterFirstHeading: boolean;
  /** Whether the previous line was itself a heading. */
  previousWasHeading: boolean;
  /** Font size shared by the confirmed headings, or 0 when unknown. */
  headingSize: number;
}

function headingText(doc: DocLine): string {
  return doc.text.trim().replace(/[:\-–—_•]+$/, "").trim();
}

/**
 * Degrees and job titles — the wording of an entry, never of a section.
 *
 * "Bachelor of Technology" contains Technology and so scores as a Skills
 * heading; being three words long it needs no other signal to be believed, and
 * the whole Education block lands under Skills. Words that genuinely do name
 * sections — certifications, honours, internships — are deliberately absent.
 */
const ENTRY_TITLE =
  /\b(bachelors?|masters?|diploma|b\.?\s?tech|m\.?\s?tech|b\.?\s?sc|m\.?\s?sc|bca|mca|mba|bba|b\.?\s?com|m\.?\s?com|ph\.?\s?d|engineer|developer|analyst|consultant|architect|administrator|specialist|coordinator|manager|director|designer|scientist)\b/i;

/** Shape tests every heading candidate must pass, whatever its wording. */
function couldBeHeading(text: string): boolean {
  if (text.length < 3 || text.length > 46) return false;
  if (/[.!?]$/.test(text)) return false;
  if (text.split(/\s+/).length > 6) return false;
  return !EMAIL.test(text) && !PERIOD.test(text);
}

function classifyHeading(doc: DocLine, context: HeadingContext): { key: BlockKey; label: string } | null {
  const text = headingText(doc);
  if (!couldBeHeading(text)) return null;
  // A line that names a qualification or a role is an entry title, however it
  // is set. Believing otherwise costs a whole section.
  if (ENTRY_TITLE.test(text)) return null;

  const { bodySize, afterFirstHeading, previousWasHeading, headingSize } = context;
  const words = text.split(/\s+/).length;
  const match = scoreHeading(text);

  // Set apart from the body by weight, case or size.
  const strongSignal = doc.bold || isAllCaps(text) || (bodySize > 0 && doc.size >= bodySize * 1.15);
  // A gap supports recognised wording but is not evidence on its own — résumés
  // leave a gap between every entry, not just before headings.
  if (match && (strongSignal || doc.gapBefore > bodySize * 1.2 || words <= 3)) {
    return { key: match, label: text };
  }

  /*
   * A styled line whose wording we do not recognise still closes the section
   * above it — otherwise its content lands under the wrong heading. The cost of
   * getting this wrong is high, though: one false positive swallows everything
   * after it. A project called "LIA" is an all-caps acronym and looked exactly
   * like a section heading, which hijacked the whole Projects section.
   *
   * So it now needs corroboration beyond "looks emphasised":
   */
  if (!afterFirstHeading || match || !strongSignal) return null;
  // A heading never follows another heading.
  if (previousWasHeading) return null;
  // Entry titles use these separators; headings do not.
  if (/[|,;:•·]/.test(text)) return null;
  // Acronyms and short names are entries far more often than sections.
  if (words < 2 && text.length < 8) return null;
  if (words > 4) return null;
  // Where font sizes are known, a real heading is set like the confirmed ones.
  if (headingSize > 0 && doc.size > 0 && Math.abs(doc.size - headingSize) > 0.6) return null;

  return { key: "other", label: text };
}

/**
 * Words that mark a line as a qualification, a job title or an academic
 * detail — never a place. Without the second group a line like "First Class"
 * or "Computer Science" sitting under a degree gets filed as a location.
 */
const NOT_A_PLACE =
  /\b(bachelor|master|diploma|degree|certificat|b\.?\s?tech|m\.?\s?tech|b\.?\s?sc|m\.?\s?sc|b\.?\s?e|m\.?\s?e|b\.?\s?a|m\.?\s?a|bca|mca|mba|b\.?\s?com|m\.?\s?com|ph\.?\s?d|engineer|engineering|developer|manager|analyst|designer|consultant|director|officer|executive|intern|lead|architect|administrator|specialist|scientist|associate|assistant|coordinator|freelance|honou?rs|distinction|class|grade|gpa|cgpa|percentage|thesis|major|minor|science|arts|commerce|studies|management|coursework|specialisation|specialization)\b/i;

/**
 * A place name with no comma to give it away — "Karnataka", "Remote",
 * "Singapore".
 *
 * Shape alone cannot separate these from an entry title, so this is only
 * consulted where the surrounding structure already settles it: inside an
 * experience or education entry that has a title and an organisation but no
 * location yet. In a projects list the same shape is the next project, which is
 * why the caller decides when to ask.
 */
function looksLikeBarePlace(text: string): boolean {
  if (text.length > 34 || /\d/.test(text)) return false;
  if (text.split(/\s+/).length > 3) return false;
  if (/[|·•,;:/]/.test(text)) return false;
  if (!/^[A-Z]/.test(text)) return false;
  if (NOT_A_PLACE.test(text)) return false;
  // "Audit", "Platform Team" — what the work covered, not where it happened.
  if (FUNCTION_NOUN.test(text)) return false;
  return !/\b(university|college|school|institute|ltd|limited|inc|gmbh|llp|pvt|technolog|solutions?)\b/i.test(text);
}

/**
 * Words that open an education entry.
 *
 * An entry there begins with a qualification or an institution; the lines
 * under it — field of study, grade, thesis — are detail. Without a way to
 * tell the two apart, "Computer Science" on its own line becomes a degree in
 * its own right.
 */
const QUALIFICATION =
  /\b(bachelors?|masters?|diploma|degree|doctorate|b\.?\s?tech|m\.?\s?tech|b\.?\s?sc|m\.?\s?sc|b\.?\s?e\.|m\.?\s?e\.|bca|mca|mba|bba|b\.?\s?com|m\.?\s?com|b\.?\s?ed|ph\.?\s?d|certificate|course|high\s+school|secondary|higher\s+secondary|hsc|ssc|cbse|icse|matriculation|intermediate|1[02]th)\b/i;

/** Words that mark a line as the name of a school rather than a detail. */
const INSTITUTION =
  /\b(universit(y|e|ies)|college|school|institute|institution|academy|polytechnic|campus|iit|nit|iiit|iim|vidyalaya|gurukul)\b/i;

/**
 * Does this line read as a place — "Bengaluru, India", "Madrid, Spain"?
 *
 * Deliberately strict. A loose version happily matches "MSc Marketing, IE
 * Business School" and files a degree as the candidate's location.
 */
export function looksLikePlace(text: string): boolean {
  if (text.length > 40 || /\d/.test(text)) return false;
  if (text.split(/\s+/).length > 5) return false;
  // Word boundaries matter: without them "inc" matches "Princeton" and "Vince",
  // rejecting real place names.
  if (/\b(university|college|school|institute|ltd|limited|inc|gmbh|llp|pvt|technolog|solutions?)\b/i.test(text)) {
    return false;
  }
  return /^[A-Za-z .'-]+,\s*[A-Za-z .'-]+$/.test(text);
}

/**
 * The part of a title that names what the role covers, not who it was for.
 *
 * "Assistant Manager - Audit" is one job title. Split on the hyphen and the
 * specialism becomes the employer, which then pushes the real employer on the
 * line below out into an entry of its own.
 */
const FUNCTION_NOUN =
  /^(?:[a-z]+\s+)?(audit|tax|taxation|finance|accounts?|accounting|operations?|sales|marketing|hr|human\s+resources|payroll|treasury|compliance|risk|strategy|research|analytics|data|design|testing|qa|quality|support|infrastructure|security|backend|front-?end|full-?stack|devops|mobile|web|cloud|product|program|projects?|team|division|unit|department|practice|desk|squad|vertical|function)$/i;

/** Split an entry opening line into a role and an organisation. */
function splitRole(text: string): { title: string; subtitle: string } {
  for (const separator of [" | ", " — ", " – ", " at ", " · ", ", ", " - ", " / "]) {
    const index = text.indexOf(separator);
    if (index <= 2 || index >= text.length - 2) continue;
    const subtitle = text.slice(index + separator.length).trim();
    // A hyphen or a comma is the one separator people also use inside a title.
    const weak = separator === " - " || separator === ", ";
    if (weak && FUNCTION_NOUN.test(subtitle)) continue;
    return { title: text.slice(0, index).trim(), subtitle };
  }
  return { title: text.trim(), subtitle: "" };
}

/**
 * Pull a trailing place out of an organisation field.
 *
 * One-line headers are usually "Role | Company | City, Country", and
 * `splitRole` only takes the first separator — leaving the city glued to the
 * company. Only called where a place is expected: in a projects list the tail
 * of "Flyworld — OTA Website, React" is a tool, not a town.
 */
function splitOrgPlace(subtitle: string): { org: string; place: string } {
  for (const separator of [" | ", " · ", " — ", " – ", " - ", ", "]) {
    const index = subtitle.lastIndexOf(separator);
    if (index <= 0) continue;
    const head = subtitle.slice(0, index).trim();
    const tail = subtitle.slice(index + separator.length).trim();
    if (!head || !tail) continue;
    if (looksLikePlace(tail) || looksLikeBarePlace(tail)) return { org: head, place: tail };
  }
  return { org: subtitle, place: "" };
}

const TRAILING_YEAR = /\s+[([]?((?:19|20)\d{2})[)\]]?$/;

function takePeriod(text: string): { rest: string; period: string } {
  const tidy = (value: string) =>
    value.replace(/[|·—–\-,]\s*$/, "").replace(/^\s*[|·—–\-,]/, "").trim();

  const match = text.match(PERIOD);
  if (match) {
    return { rest: tidy(text.replace(match[0], "")), period: match[0].replace(/\s+/g, " ").trim() };
  }

  // A lone year at the end of the line is a date too. Projects and
  // certifications are usually dated this way, and leaving it attached makes
  // the year part of the title.
  const year = text.match(TRAILING_YEAR);
  if (year) return { rest: tidy(text.replace(year[0], "")), period: year[1] };

  return { rest: text, period: "" };
}

/** Group a block of lines into entries. */
function parseEntries(lines: DocLine[], bodySize: number, blockKey: BlockKey): Item[] {
  // Only roles and qualifications carry a place. Everywhere else — projects
  // above all — a short capitalised line is the next entry, not a location.
  const expectsLocation = blockKey === "experience" || blockKey === "education";
  const entries: Item[] = [];
  let current: Item | null = null;

  // Bullets are recognised by indentation as well as by their glyph. The glyph
  // alone is not enough: PDFs draw bullets from whatever font the author used,
  // and a Symbol or Wingdings bullet comes out of text extraction as an
  // arbitrary character. Sitting further right than the rest of the block is the
  // reliable signal, and it also catches bullets that have no glyph at all.
  const baseIndent = Math.min(...lines.map((l) => l.indent));

  for (const doc of lines) {
    const text = doc.text.trim();
    if (!text) continue;

    const indented = doc.indent > baseIndent + 5;
    const hasGlyph = BULLET.test(text);
    if (hasGlyph || indented) {
      const value = (hasGlyph ? text.replace(BULLET, "") : text.replace(/^[^\w\s]+\s*/, "")).trim();
      if (!value) continue;
      if (current) current.bullets = [...(current.bullets ?? []), value];
      else current = pushEntry(entries, { id: uid("it"), title: value });
      continue;
    }

    // A line carrying nothing but a date belongs to the entry above it. Résumés
    // routinely put the years on their own line under the role.
    if (DATE_ONLY.test(text)) {
      if (current && !current.period) current.period = text.replace(/[()]/g, "").trim();
      continue;
    }

    // "Tech: React, Node" under a project is a tag list, not prose. Project
    // sections use this constantly, and reading it as a description buries the
    // stack in a sentence.
    const stack = text.match(/^(?:tech(?:nologies)?|stack|tools?|built\s+with|skills?\s+used)\s*[:–—-]\s*(.+)$/i);
    if (stack && current) {
      current.tags = [...(current.tags ?? []), ...toTags(stack[1].replace(/\s*[|·•]\s*/g, ","))];
      continue;
    }

    // A line that is only a link is the entry's link.
    if (current && LINK_ONLY.test(text)) {
      current.url = current.url || text.replace(/^(link|url|repo|demo|github)\s*[:–—-]\s*/i, "").trim();
      continue;
    }

    const { rest, period } = takePeriod(text);
    // A date range always starts an entry. A bare year only does so on a short
    // line — long lines mentioning a year are prose belonging to the entry above.
    // A bold or larger line starts one too, which is how entries are marked in
    // résumés that put dates on their own line or omit them entirely.
    const emphasised = doc.bold || (bodySize > 0 && doc.size >= bodySize * 1.08);
    // A place line belongs to the entry above it, not to a new one. A comma-
    // shaped one is unambiguous anywhere; a bare one like "Karnataka" is only
    // read as a place when the entry it would join already has a title and an
    // organisation and is still missing a location.
    // Either shape is only a location once the entry names an organisation. The
    // line directly under a role is the employer — "Infosys, Pune" is Infosys in
    // Pune, not a town called Infosys — so it is left for the organisation branch
    // below, which splits the place back out of it.
    const placeHere = looksLikePlace(text) || (expectsLocation && looksLikeBarePlace(text));
    if (current?.subtitle && !current.location && placeHere) {
      current.location = text;
      continue;
    }

    // Under a degree that already names its school, a plain line is a detail of
    // it — the field, the grade, the thesis — and not the next qualification.
    // Dated lines are left alone: a date always opens an entry.
    if (
      current &&
      blockKey === "education" &&
      current.title &&
      current.subtitle &&
      !period &&
      !QUALIFICATION.test(text) &&
      !INSTITUTION.test(text)
    ) {
      current.bullets = [...(current.bullets ?? []), text];
      continue;
    }

    // An entry that already has an organisation and a date is complete, so the
    // next plain line starts the following one. This is how certification and
    // award lists read, where entries carry no emphasis of their own.
    // Prose never starts an entry, whatever else is true of it. Project
    // sections put a full sentence under each title, and without this the
    // description becomes an entry of its own.
    const isSentence = /[.!?]$/.test(text) || text.split(/\s+/).length > 9;

    /**
     * Once an entry has any detail of its own, the next title-shaped line is
     * the following entry.
     *
     * This used to require a date, which meant an undated list never split at
     * all — and an undated list is exactly how most people write a projects
     * section. Every project after the first was appended to the first one's
     * description.
     */
    const previousHasDetail = Boolean(
      current && (current.subtitle || current.period || current.bullets?.length || current.description),
    );
    // Titles start with a capital or a digit; a wrapped sentence continues in
    // lower case, which is what keeps descriptions from splitting.
    const looksLikeTitle = /^[A-Z0-9]/.test(text) && !isSentence && text.length <= 80;

    const startsEntry =
      Boolean(period) ||
      !current ||
      (looksLikeTitle && (SINGLE_YEAR.test(text) || emphasised || previousHasDetail));

    if (startsEntry) {
      const source = rest || text;
      const { title, subtitle } = splitRole(source);
      // "Finance Manager | Godrej | Mumbai, India" carries all three facts on one
      // line; without this the city stays glued to the company.
      const { org, place } = expectsLocation ? splitOrgPlace(subtitle) : { org: subtitle, place: "" };
      // A lone date line belongs to the entry above, not to a new empty one.
      if (!source && current) {
        current.period = current.period || period;
        continue;
      }
      current = pushEntry(entries, {
        id: uid("it"),
        title,
        subtitle: org || undefined,
        location: place || undefined,
        period: period || undefined,
      });
      continue;
    }

    if (!current) continue;
    if (period && !current.period) current.period = period;

    // A short fragment under the title is the organisation; a sentence is prose.
    // Projects lean on this — "Route planning web app" is a subtitle, while
    // "Plans multi-day hiking routes…" is the description.
    if (!current.subtitle && !isSentence && text.length < 70) {
      const { org, place } = expectsLocation ? splitOrgPlace(text) : { org: text, place: "" };
      current.subtitle = org || text;
      if (place && !current.location) current.location = place;
    } else {
      current.description = [current.description, text].filter(Boolean).join(" ");
    }
  }

  return entries.filter((entry) => entry.title);
}

function pushEntry(entries: Item[], entry: Item): Item {
  entries.push(entry);
  return entry;
}

/** Pull comma, pipe or bullet separated values out of a list-shaped block. */
function parseList(lines: DocLine[]): string[] {
  const values = new Set<string>();
  for (const doc of lines) {
    // Drop a leading "Languages:" style label before splitting.
    const body = doc.text.replace(BULLET, "").replace(/^[^:]{0,28}:\s*/, "");
    for (const part of body.split(/[,;|·•]|\s{3,}/)) {
      const value = part.trim().replace(/[.]$/, "");
      if (value.length > 1 && value.length < 40 && /[a-z]/i.test(value)) values.add(value);
    }
  }
  return [...values];
}

export function parseResume(input: (DocLine | string)[]): ParsedResume {
  const lines: DocLine[] = input
    .map((entry) => (typeof entry === "string" ? line(entry) : entry))
    .map((entry) => ({ ...entry, text: entry.text.replace(/\s+/g, " ").trim() }))
    .filter((entry) => entry.text);

  // The body size is the most common size in the document; headings are what
  // stands out from it.
  const counts = new Map<number, number>();
  for (const entry of lines) {
    const bucket = Math.round(entry.size * 2) / 2;
    if (bucket > 0) counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
  }
  const bodySize = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;

  const result: ParsedResume = {
    name: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    links: [],
    summary: "",
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    awards: [],
    languages: [],
    confidence: "low",
    headings: [],
    unparsed: [],
  };

  // Contact details can appear anywhere, so sweep the whole document first.
  for (const entry of lines) {
    if (!result.email) result.email = entry.text.match(EMAIL)?.[0] ?? "";
    if (!result.phone) {
      const phone = entry.text.match(PHONE)?.[0]?.trim() ?? "";
      const digits = phone.replace(/\D/g, "").length;
      // Reject date ranges and long digit runs that are not phone numbers.
      if (phone && !PERIOD.test(phone) && digits >= 8 && digits <= 15) result.phone = phone;
    }
    // "arjun.mehta@example.com" contains two domain-shaped substrings. Removing
    // addresses first stops "arjun.me" being collected as a website.
    const withoutEmails = entry.text.replace(new RegExp(EMAIL.source, "gi"), " ");
    for (const match of withoutEmails.matchAll(new RegExp(URL_SOURCE, "gi"))) {
      const url = match[0].replace(/[),.;]+$/, "");
      if (!result.links.includes(url)) result.links.push(url);
    }
  }
  result.website = result.links.find((l) => !/linkedin|github|gitlab|twitter|x\.com|behance|dribbble|medium/i.test(l)) ?? "";

  // Split into blocks at each heading.
  const blocks = new Map<BlockKey, DocLine[]>();
  // A first pass over the headings we are sure about — the keyword-matched ones
  // — establishes how this document sets a heading. The second pass uses that to
  // judge headings whose wording is unfamiliar.
  const confirmedSizes = lines
    .filter((entry) => couldBeHeading(headingText(entry)) && scoreHeading(headingText(entry)))
    .map((entry) => Math.round(entry.size * 2) / 2)
    .filter((size) => size > 0);
  const sizeCounts = new Map<number, number>();
  for (const size of confirmedSizes) sizeCounts.set(size, (sizeCounts.get(size) ?? 0) + 1);
  const headingSize = [...sizeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;

  let section: BlockKey = "header";
  let sawHeading = false;
  let previousWasHeading = false;
  for (const entry of lines) {
    const heading = classifyHeading(entry, {
      bodySize,
      afterFirstHeading: sawHeading,
      previousWasHeading,
      headingSize,
    });
    previousWasHeading = Boolean(heading);
    if (heading) {
      section = heading.key;
      if (heading.key !== "other") {
        sawHeading = true;
        result.headings.push(heading.label);
      }
      continue;
    }
    blocks.set(section, [...(blocks.get(section) ?? []), entry]);
  }

  // The header holds the name and title, before any contact clutter.
  const header = blocks.get("header") ?? [];
  const headerText = header.filter(
    (entry) =>
      !EMAIL.test(entry.text) &&
      !(PHONE.test(entry.text) && entry.text.replace(/\D/g, "").length >= 8) &&
      !new RegExp(URL_SOURCE, "i").test(entry.text),
  );

  // The name is usually the largest text on the page; fall back to the first line.
  const biggest = [...headerText].sort((a, b) => b.size - a.size)[0];
  result.name =
    biggest && bodySize > 0 && biggest.size > bodySize * 1.25 ? biggest.text : headerText[0]?.text ?? "";
  result.headline = headerText.find((entry) => entry.text !== result.name)?.text ?? "";

  // A location tends to read "City, Country" without digits.
  const isPlace = (text: string) => looksLikePlace(text) && text !== result.name && text !== result.headline;
  // Contact lines often pack several fields together: "email | phone | city",
  // and such a line was filtered out of headerText for carrying an address. The
  // search stays inside the header: further down, the first place-shaped line
  // belongs to a job, and an old employer city is not where someone lives.
  const candidates = header
    .flatMap((entry) => [entry.text, ...entry.text.split(/\s*[|·•]\s*/)])
    .map((text) => text.trim());
  result.location = headerText.map((e) => e.text).find(isPlace) ?? candidates.find(isPlace) ?? "";

  result.summary = (blocks.get("summary") ?? []).map((entry) => entry.text).join(" ").trim();
  // Without an explicit heading, a long paragraph in the header is the summary.
  if (!result.summary) {
    const paragraph = headerText.slice(2).find((entry) => entry.text.length > 90);
    if (paragraph) result.summary = paragraph.text;
  }

  result.experience = parseEntries(blocks.get("experience") ?? [], bodySize, "experience");
  result.education = parseEntries(blocks.get("education") ?? [], bodySize, "education");
  result.projects = parseEntries(blocks.get("projects") ?? [], bodySize, "projects");
  result.certifications = parseEntries(blocks.get("certifications") ?? [], bodySize, "certifications");
  result.awards = parseEntries(blocks.get("awards") ?? [], bodySize, "awards");
  result.skills = parseList(blocks.get("skills") ?? []);
  result.languages = parseList(blocks.get("languages") ?? []);

  const found =
    (result.experience.length > 0 ? 1 : 0) +
    (result.education.length > 0 ? 1 : 0) +
    (result.skills.length > 0 ? 1 : 0) +
    (result.name ? 1 : 0) +
    (result.email || result.phone ? 1 : 0);
  result.confidence = found >= 4 ? "high" : found >= 2 ? "medium" : "low";

  result.unparsed = (blocks.get("other") ?? []).map((entry) => entry.text);
  return result;
}

export async function importResumeFile(file: File): Promise<ParsedResume> {
  return parseResume(await extractLines(file));
}

/** Split a comma-separated skills string the same way the parser does. */
export const splitSkills = toTags;
