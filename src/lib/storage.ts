import { normalizeDoc } from "./defaults";
import type { PortfolioDoc } from "./types";

/**
 * localStorage persistence.
 *
 * The builder is entirely client-side: projects live in the browser, and
 * everything that leaves it does so as a file download or a share link. Every
 * access is guarded because localStorage throws in private mode and is simply
 * absent during server rendering.
 */

const PROJECTS_KEY = "pb:projects";
const ACTIVE_KEY = "pb:active";

export interface ProjectSummary {
  id: string;
  name: string;
  presetId: string;
  template: string;
  updatedAt: number;
  createdAt: number;
}

function docKey(id: string) {
  return `pb:doc:${id}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Quota exceeded, or storage blocked. The caller surfaces this to the user.
    return false;
  }
}

export function listProjects(): ProjectSummary[] {
  return readJson<ProjectSummary[]>(PROJECTS_KEY, []).sort((a, b) => b.updatedAt - a.updatedAt);
}

/* ─────────────────────── External store plumbing ─────────────────────── */

/**
 * localStorage is an external store, so components read it through
 * `useSyncExternalStore` rather than copying it into state inside an effect.
 * That needs a snapshot which is referentially stable between changes, hence
 * the cache keyed on the raw serialised value.
 */
const listeners = new Set<() => void>();

const EMPTY: ProjectSummary[] = [];
let snapshotCache: ProjectSummary[] = EMPTY;
let snapshotKey: string | null = null;

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeToProjects(listener: () => void): () => void {
  listeners.add(listener);
  // `storage` fires when another tab writes, keeping open tabs consistent.
  if (typeof window !== "undefined") window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", listener);
  };
}

export function getProjectsSnapshot(): ProjectSummary[] {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(PROJECTS_KEY);
  } catch {
    return EMPTY;
  }
  if (raw === snapshotKey) return snapshotCache;
  snapshotKey = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as ProjectSummary[]) : [];
    snapshotCache = parsed.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    snapshotCache = EMPTY;
  }
  return snapshotCache;
}

/** Nothing is stored on the server, so the server snapshot is always empty. */
export function getProjectsServerSnapshot(): ProjectSummary[] {
  return EMPTY;
}

export function loadProject(id: string): PortfolioDoc | null {
  const raw = readJson<PortfolioDoc | null>(docKey(id), null);
  return raw ? normalizeDoc(raw) : null;
}

/** Persist a document and refresh its summary row. Returns false if storage is full. */
export function saveProject(doc: PortfolioDoc): boolean {
  const stamped = { ...doc, updatedAt: Date.now() };
  if (!writeJson(docKey(doc.id), stamped)) return false;

  const summaries = readJson<ProjectSummary[]>(PROJECTS_KEY, []);
  const summary: ProjectSummary = {
    id: stamped.id,
    name: stamped.name,
    presetId: stamped.presetId,
    template: stamped.template,
    updatedAt: stamped.updatedAt,
    createdAt: stamped.createdAt,
  };
  const next = summaries.filter((s) => s.id !== doc.id);
  next.unshift(summary);
  const ok = writeJson(PROJECTS_KEY, next);
  emit();
  return ok;
}

/**
 * Delete every project.
 *
 * Removes the documents as well as the summaries — leaving the documents
 * behind would keep the space occupied and quietly fill the quota.
 */
export function clearAllProjects(): void {
  if (typeof window === "undefined") return;
  for (const summary of readJson<ProjectSummary[]>(PROJECTS_KEY, [])) {
    try {
      window.localStorage.removeItem(docKey(summary.id));
    } catch {
      /* ignore */
    }
  }
  writeJson(PROJECTS_KEY, []);
  setActiveProjectId(null);
  emit();
}

export function deleteProject(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(docKey(id));
  } catch {
    /* ignore */
  }
  writeJson(
    PROJECTS_KEY,
    readJson<ProjectSummary[]>(PROJECTS_KEY, []).filter((s) => s.id !== id),
  );
  if (getActiveProjectId() === id) setActiveProjectId(null);
  emit();
}

export function getActiveProjectId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function setActiveProjectId(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id) window.localStorage.setItem(ACTIVE_KEY, id);
    else window.localStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* ignore */
  }
}

/** Approximate bytes used by the builder's own keys. */
export function storageUsage(): number {
  if (typeof window === "undefined") return 0;
  try {
    let total = 0;
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key?.startsWith("pb:")) continue;
      total += (window.localStorage.getItem(key)?.length ?? 0) + key.length;
    }
    return total * 2; // UTF-16 code units
  } catch {
    return 0;
  }
}
