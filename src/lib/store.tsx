"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createDoc } from "./defaults";
import { createSection, getSectionDef } from "./sections";
import * as storage from "./storage";
import type { Item, PortfolioDoc, Section, SectionType } from "./types";
import { deepClone, move, slugify, uid, uniqueSlug } from "./utils";

/**
 * Builder state.
 *
 * `update` takes a mutator that edits a throwaway clone of the document, which
 * gives immer-like ergonomics without the dependency. Consecutive edits sharing
 * a `coalesce` key collapse into one history entry, so typing a name is one
 * undo step rather than one per keystroke.
 */

export type DeviceSize = "desktop" | "tablet" | "mobile";
/** Which document the builder is currently editing and previewing. */
export type OutputMode = "portfolio" | "resume";
export type PanelId =
  | "start"
  | "templates"
  | "theme"
  | "sections"
  | "content"
  | "profile"
  | "settings"
  | "resume"
  | "publish"
  | "export";

interface UpdateOptions {
  /** Edits sharing a key within the coalesce window collapse into one entry. */
  coalesce?: string;
  /** Skip the history stack entirely (used for transient UI-only changes). */
  silent?: boolean;
}

interface BuilderValue {
  doc: PortfolioDoc;
  update: (mutator: (draft: PortfolioDoc) => void, options?: UpdateOptions) => void;
  replaceDoc: (doc: PortfolioDoc, options?: { resetHistory?: boolean }) => void;

  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  panel: PanelId;
  setPanel: (panel: PanelId) => void;
  selectedSectionId: string | null;
  selectSection: (id: string | null, options?: { openContent?: boolean }) => void;
  selectedSection: Section | null;

  device: DeviceSize;
  setDevice: (device: DeviceSize) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  /** Hides the builder chrome so the canvas fills the window. */
  focusMode: boolean;
  setFocusMode: (value: boolean) => void;
  /** Portfolio or résumé — the same content, two outputs. */
  outputMode: OutputMode;
  setOutputMode: (mode: OutputMode) => void;

  saveState: "idle" | "saving" | "saved" | "error";
  saveNow: () => void;

  // Section operations
  addSection: (type: SectionType) => void;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  moveSection: (id: string, direction: -1 | 1) => void;
  reorderSections: (from: number, to: number) => void;
  toggleSection: (id: string) => void;
  patchSection: (id: string, patch: Partial<Section>, options?: UpdateOptions) => void;

  // Item operations
  addItem: (sectionId: string, parentItemId?: string) => void;
  removeItem: (sectionId: string, itemId: string, parentItemId?: string) => void;
  duplicateItem: (sectionId: string, itemId: string, parentItemId?: string) => void;
  moveItem: (sectionId: string, from: number, to: number, parentItemId?: string) => void;
  patchItem: (
    sectionId: string,
    itemId: string,
    patch: Partial<Item>,
    options?: UpdateOptions & { parentItemId?: string },
  ) => void;
}

const BuilderContext = createContext<BuilderValue | null>(null);

const COALESCE_MS = 700;
const HISTORY_LIMIT = 80;

export function BuilderProvider({
  initialDoc,
  children,
}: {
  initialDoc: PortfolioDoc;
  children: ReactNode;
}) {
  const [doc, setDoc] = useState<PortfolioDoc>(initialDoc);
  const [past, setPast] = useState<PortfolioDoc[]>([]);
  const [future, setFuture] = useState<PortfolioDoc[]>([]);

  const [panel, setPanel] = useState<PanelId>("templates");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    initialDoc.sections[0]?.id ?? null,
  );
  const [device, setDevice] = useState<DeviceSize>("desktop");
  const [zoom, setZoom] = useState(1);
  const [focusMode, setFocusMode] = useState(false);
  const [outputMode, setOutputMode] = useState<OutputMode>("portfolio");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const lastCoalesce = useRef<{ key: string; at: number } | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback(
    (mutator: (draft: PortfolioDoc) => void, options: UpdateOptions = {}) => {
      setDoc((current) => {
        const draft = deepClone(current);
        mutator(draft);
        draft.updatedAt = Date.now();

        if (!options.silent) {
          const now = Date.now();
          const last = lastCoalesce.current;
          const shouldCoalesce =
            Boolean(options.coalesce) && last !== null && last.key === options.coalesce && now - last.at < COALESCE_MS;

          lastCoalesce.current = options.coalesce ? { key: options.coalesce, at: now } : null;

          if (!shouldCoalesce) {
            setPast((p) => [...p, current].slice(-HISTORY_LIMIT));
            setFuture([]);
          } else {
            // Extend the existing entry's window instead of adding a new one.
            setFuture([]);
          }
        }
        return draft;
      });
      setSaveState("saving");
    },
    [],
  );

  const replaceDoc = useCallback(
    (next: PortfolioDoc, options: { resetHistory?: boolean } = {}) => {
      setDoc((current) => {
        if (!options.resetHistory) setPast((p) => [...p, current].slice(-HISTORY_LIMIT));
        return next;
      });
      if (options.resetHistory) setPast([]);
      setFuture([]);
      lastCoalesce.current = null;
      setSelectedSectionId(next.sections[0]?.id ?? null);
      setSaveState("saving");
    },
    [],
  );

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const previous = p[p.length - 1];
      setDoc((current) => {
        setFuture((f) => [current, ...f].slice(0, HISTORY_LIMIT));
        return previous;
      });
      lastCoalesce.current = null;
      setSaveState("saving");
      return p.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setDoc((current) => {
        setPast((p) => [...p, current].slice(-HISTORY_LIMIT));
        return next;
      });
      lastCoalesce.current = null;
      setSaveState("saving");
      return f.slice(1);
    });
  }, []);

  /* ─────────────────────────── Persistence ─────────────────────────── */

  const saveNow = useCallback(() => {
    const ok = storage.saveProject(doc);
    storage.setActiveProjectId(doc.id);
    setSaveState(ok ? "saved" : "error");
  }, [doc]);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const ok = storage.saveProject(doc);
      storage.setActiveProjectId(doc.id);
      setSaveState(ok ? "saved" : "error");
    }, 700);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [doc]);

  /* ─────────────────────── Keyboard shortcuts ─────────────────────── */

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault();
        redo();
      } else if (key === "s") {
        event.preventDefault();
        saveNow();
      } else if (key === "\\") {
        event.preventDefault();
        setFocusMode((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, saveNow]);

  /* ─────────────────────── Section operations ─────────────────────── */

  const selectSection = useCallback((id: string | null, options: { openContent?: boolean } = {}) => {
    setSelectedSectionId(id);
    if (options.openContent && id) setPanel("content");
  }, []);

  const addSection = useCallback(
    (type: SectionType) => {
      const def = getSectionDef(type);
      let newId = "";
      update((draft) => {
        if (def.singleton && draft.sections.some((s) => s.type === type)) return;
        // Sample copy follows the profession this document was started from.
        const section = createSection(type, draft.sections, draft.presetId);
        newId = section.id;
        draft.sections.push(section);
      });
      if (newId) {
        setSelectedSectionId(newId);
        setPanel("content");
      }
    },
    [update],
  );

  const removeSection = useCallback(
    (id: string) => {
      update((draft) => {
        draft.sections = draft.sections.filter((s) => s.id !== id);
      });
      setSelectedSectionId((current) => (current === id ? null : current));
    },
    [update],
  );

  const duplicateSection = useCallback(
    (id: string) => {
      update((draft) => {
        const index = draft.sections.findIndex((s) => s.id === id);
        if (index === -1) return;
        const source = draft.sections[index];
        const copy: Section = {
          ...deepClone(source),
          id: uid("sec"),
          title: `${source.title} copy`,
          anchor: uniqueSlug(
            slugify(`${source.title}-copy`),
            draft.sections.map((s) => s.anchor),
          ),
          items: source.items.map((it) => ({
            ...deepClone(it),
            id: uid("it"),
            items: it.items?.map((child) => ({ ...deepClone(child), id: uid("it") })),
          })),
        };
        draft.sections.splice(index + 1, 0, copy);
      });
    },
    [update],
  );

  const moveSection = useCallback(
    (id: string, direction: -1 | 1) => {
      update((draft) => {
        const index = draft.sections.findIndex((s) => s.id === id);
        const target = index + direction;
        if (index === -1 || target < 0 || target >= draft.sections.length) return;
        draft.sections = move(draft.sections, index, target);
      });
    },
    [update],
  );

  const reorderSections = useCallback(
    (from: number, to: number) => {
      update((draft) => {
        draft.sections = move(draft.sections, from, to);
      });
    },
    [update],
  );

  const toggleSection = useCallback(
    (id: string) => {
      update((draft) => {
        const section = draft.sections.find((s) => s.id === id);
        if (section) section.enabled = !section.enabled;
      });
    },
    [update],
  );

  const patchSection = useCallback(
    (id: string, patch: Partial<Section>, options?: UpdateOptions) => {
      update((draft) => {
        const index = draft.sections.findIndex((s) => s.id === id);
        if (index === -1) return;
        draft.sections[index] = { ...draft.sections[index], ...patch };
      }, options);
    },
    [update],
  );

  /* ───────────────────────── Item operations ───────────────────────── */

  /** Resolve the item list an operation targets — a section's, or a nested group's. */
  function listFor(section: Section, parentItemId?: string): Item[] | null {
    if (!parentItemId) return section.items;
    const parent = section.items.find((it) => it.id === parentItemId);
    if (!parent) return null;
    if (!parent.items) parent.items = [];
    return parent.items;
  }

  const addItem = useCallback(
    (sectionId: string, parentItemId?: string) => {
      update((draft) => {
        const section = draft.sections.find((s) => s.id === sectionId);
        if (!section) return;
        const list = listFor(section, parentItemId);
        if (!list) return;
        const def = getSectionDef(section.type);
        list.push({ id: uid("it"), title: `New ${def.itemLabel.toLowerCase()}` });
      });
    },
    [update],
  );

  const removeItem = useCallback(
    (sectionId: string, itemId: string, parentItemId?: string) => {
      update((draft) => {
        const section = draft.sections.find((s) => s.id === sectionId);
        if (!section) return;
        if (parentItemId) {
          const parent = section.items.find((it) => it.id === parentItemId);
          if (parent?.items) parent.items = parent.items.filter((it) => it.id !== itemId);
        } else {
          section.items = section.items.filter((it) => it.id !== itemId);
        }
      });
    },
    [update],
  );

  const duplicateItem = useCallback(
    (sectionId: string, itemId: string, parentItemId?: string) => {
      update((draft) => {
        const section = draft.sections.find((s) => s.id === sectionId);
        if (!section) return;
        const list = listFor(section, parentItemId);
        if (!list) return;
        const index = list.findIndex((it) => it.id === itemId);
        if (index === -1) return;
        const copy = deepClone(list[index]);
        copy.id = uid("it");
        copy.items = copy.items?.map((child) => ({ ...child, id: uid("it") }));
        list.splice(index + 1, 0, copy);
      });
    },
    [update],
  );

  const moveItem = useCallback(
    (sectionId: string, from: number, to: number, parentItemId?: string) => {
      update((draft) => {
        const section = draft.sections.find((s) => s.id === sectionId);
        if (!section) return;
        if (parentItemId) {
          const parent = section.items.find((it) => it.id === parentItemId);
          if (parent?.items) parent.items = move(parent.items, from, to);
        } else {
          section.items = move(section.items, from, to);
        }
      });
    },
    [update],
  );

  const patchItem = useCallback(
    (
      sectionId: string,
      itemId: string,
      patch: Partial<Item>,
      options: UpdateOptions & { parentItemId?: string } = {},
    ) => {
      const { parentItemId, ...updateOptions } = options;
      update((draft) => {
        const section = draft.sections.find((s) => s.id === sectionId);
        if (!section) return;
        const list = listFor(section, parentItemId);
        if (!list) return;
        const index = list.findIndex((it) => it.id === itemId);
        if (index === -1) return;
        list[index] = { ...list[index], ...patch };
      }, updateOptions);
    },
    [update],
  );

  const selectedSection = useMemo(
    () => doc.sections.find((s) => s.id === selectedSectionId) ?? null,
    [doc.sections, selectedSectionId],
  );

  const value = useMemo<BuilderValue>(
    () => ({
      doc,
      update,
      replaceDoc,
      undo,
      redo,
      canUndo: past.length > 0,
      canRedo: future.length > 0,
      panel,
      setPanel,
      selectedSectionId,
      selectSection,
      selectedSection,
      device,
      setDevice,
      zoom,
      setZoom,
      focusMode,
      setFocusMode,
      outputMode,
      setOutputMode,
      saveState,
      saveNow,
      addSection,
      removeSection,
      duplicateSection,
      moveSection,
      reorderSections,
      toggleSection,
      patchSection,
      addItem,
      removeItem,
      duplicateItem,
      moveItem,
      patchItem,
    }),
    [
      doc,
      update,
      replaceDoc,
      undo,
      redo,
      past.length,
      future.length,
      panel,
      selectedSectionId,
      selectSection,
      selectedSection,
      device,
      zoom,
      focusMode,
      outputMode,
      saveState,
      saveNow,
      addSection,
      removeSection,
      duplicateSection,
      moveSection,
      reorderSections,
      toggleSection,
      patchSection,
      addItem,
      removeItem,
      duplicateItem,
      moveItem,
      patchItem,
    ],
  );

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
}

export function useBuilder(): BuilderValue {
  const context = useContext(BuilderContext);
  if (!context) throw new Error("useBuilder must be used inside <BuilderProvider>");
  return context;
}

/** Load the active project, or create one, for the builder's first render. */
export function resolveInitialDoc(): PortfolioDoc {
  const activeId = storage.getActiveProjectId();
  if (activeId) {
    const existing = storage.loadProject(activeId);
    if (existing) return existing;
  }
  const first = storage.listProjects()[0];
  if (first) {
    const existing = storage.loadProject(first.id);
    if (existing) return existing;
  }
  return createDoc("developer");
}
