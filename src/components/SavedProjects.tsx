"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { clearAllProjects, deleteProject } from "@/lib/storage";
import { useProjects } from "@/lib/use-projects";
import { projectLabel } from "@/lib/utils";

/**
 * The saved projects list on the landing page.
 *
 * Two things it is careful about. Long lists are collapsed to the most recent
 * few, because a wall of near-identical cards is where a project list stops
 * being useful. And clearing everything asks first, in words that say how many
 * are about to go — there is no undo behind it.
 */

/** How many are shown before the list is collapsed. */
const VISIBLE = 6;

export function SavedProjects() {
  const projects = useProjects();
  const [showAll, setShowAll] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (projects.length === 0) return null;

  const shown = showAll ? projects : projects.slice(0, VISIBLE);
  const hidden = projects.length - shown.length;

  return (
    <section className="mb-16" aria-labelledby="saved-projects">
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2
          id="saved-projects"
          className="text-[13px] font-semibold uppercase tracking-[0.09em] text-[var(--color-faint)]"
        >
          Your projects ({projects.length})
        </h2>

        <div className="ml-auto flex items-center gap-2">
          {confirming ? (
            <>
              <span className="text-[12.5px] text-[var(--color-dim)]">
                Delete all {projects.length}? This cannot be undone.
              </span>
              <button
                type="button"
                className="ui-btn"
                data-tone="danger"
                style={{ padding: "3px 9px", fontSize: "11.5px", height: "auto" }}
                autoFocus
                onClick={() => {
                  clearAllProjects();
                  setConfirming(false);
                  setShowAll(false);
                }}
              >
                Delete all
              </button>
              <button
                type="button"
                className="ui-btn"
                style={{ padding: "3px 9px", fontSize: "11.5px", height: "auto" }}
                onClick={() => setConfirming(false)}
              >
                Keep them
              </button>
            </>
          ) : (
            <button
              type="button"
              className="ui-btn"
              style={{ padding: "3px 9px", fontSize: "11.5px", height: "auto" }}
              onClick={() => setConfirming(true)}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <ul className="grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((project) => (
          <li key={project.id} className="ui-card flex items-center gap-3 p-3">
            <Link href={`/builder?project=${project.id}`} className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-medium">{projectLabel(project.name)}</span>
              <span className="block text-[11.5px] text-[var(--color-faint)]">
                {project.template} · edited {new Date(project.updatedAt).toLocaleDateString()}
              </span>
            </Link>
            <DeleteButton label={projectLabel(project.name)} onDelete={() => deleteProject(project.id)} />
          </li>
        ))}
      </ul>

      {hidden > 0 || showAll ? (
        <button type="button" className="ui-btn mt-2" onClick={() => setShowAll((open) => !open)}>
          <ChevronDown size={14} style={{ transform: showAll ? "rotate(180deg)" : undefined }} />
          {showAll ? "Show fewer" : `Show all ${projects.length}`}
        </button>
      ) : null}
    </section>
  );
}
