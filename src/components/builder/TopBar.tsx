"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  CloudOff,
  ExternalLink,
  Loader2,
  Maximize2,
  Minimize2,
  Monitor,
  Plus,
  Redo2,
  Smartphone,
  Tablet,
  Undo2,
} from "lucide-react";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { createDoc } from "@/lib/defaults";
import { useBuilder, type DeviceSize } from "@/lib/store";
import * as storage from "@/lib/storage";
import { useProjects } from "@/lib/use-projects";
import { projectLabel } from "@/lib/utils";

const DEVICES: { value: DeviceSize; label: string; icon: typeof Monitor }[] = [
  { value: "desktop", label: "Desktop", icon: Monitor },
  { value: "tablet", label: "Tablet", icon: Tablet },
  { value: "mobile", label: "Mobile", icon: Smartphone },
];

/** Project switcher: create, open and delete the projects held in this browser. */
function ProjectMenu() {
  const { doc, replaceDoc, saveNow } = useBuilder();
  const [open, setOpen] = useState(false);
  const projects = useProjects();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="ui-btn min-w-0 max-w-[132px] sm:max-w-[220px]"
        data-tone="ghost"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="truncate">{projectLabel(doc.name)}</span>
        <ChevronDown size={13} />
      </button>

      {open ? (
        <div className="ui-card ui-fade absolute left-0 top-[calc(100%+6px)] z-50 w-[300px] p-2 shadow-2xl">
          <div className="mb-1.5 px-1.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[var(--color-faint)]">
            Projects in this browser
          </div>
          <div className="max-h-64 overflow-y-auto thin-scroll">
            {projects.length === 0 ? (
              <p className="px-1.5 py-2 text-[12px] text-[var(--color-faint)]">No saved projects yet.</p>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-1 rounded-lg px-1.5 py-1 hover:bg-[var(--color-hover)]"
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 py-1 text-left"
                    onClick={() => {
                      saveNow();
                      const loaded = storage.loadProject(project.id);
                      if (loaded) {
                        replaceDoc(loaded, { resetHistory: true });
                        storage.setActiveProjectId(loaded.id);
                      }
                      setOpen(false);
                    }}
                  >
                    <span className="block truncate text-[12.5px]">{projectLabel(project.name)}</span>
                    <span className="block text-[10.5px] text-[var(--color-faint)]">
                      {project.template} · {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </button>
                  {project.id === doc.id ? (
                    <Check size={13} className="mr-1 text-[var(--color-brand)]" />
                  ) : (
                    <DeleteButton
                      label={projectLabel(project.name)}
                      size={13}
                      onDelete={() => storage.deleteProject(project.id)}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            className="ui-btn mt-2 w-full"
            onClick={() => {
              saveNow();
              const fresh = createDoc("developer");
              storage.saveProject(fresh);
              storage.setActiveProjectId(fresh.id);
              replaceDoc(fresh, { resetHistory: true });
              setOpen(false);
            }}
          >
            <Plus size={14} />
            New project
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SaveIndicator() {
  const { saveState } = useBuilder();
  if (saveState === "error") {
    return (
      <span className="flex items-center gap-1.5 text-[11.5px] text-[var(--color-amber)]" title="Browser storage is full or blocked">
        <CloudOff size={13} />
        Not saved
      </span>
    );
  }
  if (saveState === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-[11.5px] text-[var(--color-faint)]">
        <Loader2 size={13} className="ui-spin" />
        Saving
      </span>
    );
  }
  if (saveState === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-[11.5px] text-[var(--color-faint)]">
        <Check size={13} />
        Saved
      </span>
    );
  }
  return null;
}

export function TopBar() {
  const {
    doc,
    device,
    setDevice,
    zoom,
    setZoom,
    undo,
    redo,
    canUndo,
    canRedo,
    focusMode,
    setFocusMode,
    outputMode,
    setOutputMode,
    setPanel,
  } = useBuilder();

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[var(--color-edge)] bg-[var(--color-panel)] px-3">
      <Link href="/" className="flex items-center gap-2 pr-1" title="Portfolio Builder home">
        <span className="grid size-6 place-items-center rounded-md bg-[var(--color-brand)] text-[11px] font-bold text-white">
          PB
        </span>
      </Link>

      <ProjectMenu />

      <div className="mx-auto flex min-w-0 shrink items-center gap-2">
        <div className="ui-seg">
          {(["portfolio", "resume"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              data-active={outputMode === mode ? "true" : "false"}
              onClick={() => {
                setOutputMode(mode);
                // Land on the panel that actually applies to the new mode.
                setPanel(mode === "resume" ? "resume" : "templates");
              }}
            >
              {mode === "portfolio" ? "Portfolio" : "Résumé"}
            </button>
          ))}
        </div>

        {outputMode === "portfolio" ? (
          <div className="ui-seg hidden md:inline-flex">
          {DEVICES.map(({ value, label, icon: DeviceIcon }) => (
            <button
              key={value}
              type="button"
              data-active={device === value ? "true" : "false"}
              onClick={() => setDevice(value)}
              title={label}
              aria-label={`${label} width`}
            >
              <DeviceIcon size={14} />
            </button>
          ))}
          </div>
        ) : null}

        <div className="ui-seg hidden lg:inline-flex">
          {(outputMode === "resume" ? [0.5, 0.75, 1] : [0.6, 0.8, 1]).map((level) => (
            <button
              key={level}
              type="button"
              data-active={zoom === level ? "true" : "false"}
              onClick={() => setZoom(level)}
              title={`Zoom to ${Math.round(level * 100)}%`}
            >
              {Math.round(level * 100)}%
            </button>
          ))}
        </div>
      </div>

      <span className="hidden sm:contents">
        <SaveIndicator />
      </span>

      <div className="hidden shrink-0 items-center gap-0.5 sm:flex">
        <button
          type="button"
          className="ui-icon-btn"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <Undo2 size={15} />
        </button>
        <button
          type="button"
          className="ui-icon-btn"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
        >
          <Redo2 size={15} />
        </button>
        <button
          type="button"
          className="ui-icon-btn"
          onClick={() => setFocusMode(!focusMode)}
          title="Toggle focus mode (Ctrl+\)"
          aria-label="Toggle focus mode"
        >
          {focusMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </div>

      <a
        className="ui-btn shrink-0"
        data-tone="primary"
        href={`/view?project=${doc.id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink size={14} />
        <span className="hidden sm:inline">Preview</span>
      </a>
    </header>
  );
}
