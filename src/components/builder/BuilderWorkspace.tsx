"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createDoc } from "@/lib/defaults";
import { BuilderProvider, resolveInitialDoc } from "@/lib/store";
import * as storage from "@/lib/storage";
import type { PortfolioDoc } from "@/lib/types";
import { BuilderShell } from "./BuilderShell";

/**
 * Resolves which document to open, then hands it to the provider.
 *
 * This component is loaded with `ssr: false`, so localStorage is guaranteed to
 * exist by the time it first renders. That lets the document be *read* in a
 * lazy `useState` initialiser — one render, no flash of the wrong document, no
 * hydration mismatch. Writing it back is a side effect and waits for an effect.
 */
export default function BuilderWorkspace() {
  const params = useSearchParams();

  // Resolving which document to open is a pure read, so it can happen here.
  // Anything that writes cannot — see the effect below.
  const [initial] = useState<{ doc: PortfolioDoc; write: "none" | "activate" | "create" }>(() => {
    const projectId = params.get("project");
    if (projectId) {
      const existing = storage.loadProject(projectId);
      if (existing) return { doc: existing, write: "activate" };
    }

    const presetId = params.get("preset");
    if (presetId) return { doc: createDoc(presetId), write: "create" };

    return { doc: resolveInitialDoc(), write: "none" };
  });

  /*
   * Storage writes belong in an effect, never in the state initialiser.
   *
   * saveProject and setActiveProjectId notify the projects store synchronously,
   * and during a client-side navigation the page being left is still mounted —
   * so writing while rendering meant setting state on the landing page from
   * inside this component's render, which React refuses outright.
   */
  useEffect(() => {
    if (initial.write === "none") return;
    if (initial.write === "create") storage.saveProject(initial.doc);
    storage.setActiveProjectId(initial.doc.id);

    /*
     * The query is an instruction, and it has now been carried out. Leaving it
     * in the address bar means every reload of /builder?preset=accountant
     * starts another project — refresh a few times while trying a preset out
     * and the list fills with identical copies. Replacing the entry keeps the
     * document that was just created and leaves nothing to repeat.
     */
    window.history.replaceState(null, "", "/builder");
  }, [initial]);

  return (
    <BuilderProvider initialDoc={initial.doc}>
      <BuilderShell />
    </BuilderProvider>
  );
}
