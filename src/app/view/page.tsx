"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { googleFontsHref } from "@/lib/fonts";
import { decodeDoc } from "@/lib/share";
import * as storage from "@/lib/storage";
import { displayName, joinTitle } from "@/lib/utils";
import type { PortfolioDoc } from "@/lib/types";
import { Portfolio } from "@/renderer/Portfolio";
import { RUNTIME_JS } from "@/renderer/runtime";

/**
 * Full-page portfolio view.
 *
 * Two ways in: `?project=<id>` opens something saved in this browser, and
 * `#d=<payload>` opens a document carried entirely in the URL fragment. The
 * fragment is never sent to the server, so a shared portfolio stays private
 * between the sender and whoever they give the link to.
 */
function Viewer() {
  const params = useSearchParams();
  const [doc, setDoc] = useState<PortfolioDoc | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const hash = window.location.hash;
      if (hash.startsWith("#d=")) {
        const decoded = await decodeDoc(hash.slice(3));
        if (cancelled) return;
        if (decoded) {
          setDoc(decoded);
          setState("ready");
          return;
        }
      }

      const projectId = params.get("project") ?? storage.getActiveProjectId();
      const loaded = projectId ? storage.loadProject(projectId) : null;
      if (cancelled) return;
      if (loaded) {
        setDoc(loaded);
        setState("ready");
      } else {
        setState("missing");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [params]);

  // The published page behaves exactly as the export does, because it runs the
  // same runtime script.
  useEffect(() => {
    if (state !== "ready") return;
    const script = document.createElement("script");
    script.textContent = RUNTIME_JS;
    const timer = setTimeout(() => document.body.appendChild(script), 40);
    return () => {
      clearTimeout(timer);
      script.remove();
    };
  }, [state, doc?.id, doc?.template]);

  useEffect(() => {
    if (!doc) return;
    document.title = doc.site.title.trim() || joinTitle(displayName(doc.profile.name), doc.profile.headline);
  }, [doc]);

  if (state === "loading") {
    return (
      <div className="grid h-dvh place-items-center">
        <div className="size-8 animate-spin rounded-full border-2 border-[var(--color-edge)] border-t-[var(--color-brand)]" />
      </div>
    );
  }

  if (state === "missing" || !doc) {
    return (
      <div className="grid h-dvh place-items-center px-6 text-center">
        <div className="max-w-md">
          <h1 className="text-xl font-semibold">Nothing to show here</h1>
          <p className="mt-2 text-[13.5px] text-[var(--color-dim)]">
            This link points to a project that is not saved in this browser, or the share payload could not be read.
            Share links only work in full — check nothing was cut off when it was copied.
          </p>
          <Link href="/builder" className="ui-btn mt-5 inline-flex" data-tone="primary">
            Open the builder
          </Link>
        </div>
      </div>
    );
  }

  const fontsHref = googleFontsHref([doc.theme.headingFont, doc.theme.bodyFont, doc.theme.monoFont]);

  return (
    <>
      {/*
        React hoists these into <head>. The portfolio stylesheet is deliberately
        a plain static file rather than a Tailwind import: the HTML export inlines
        this exact file, so it cannot depend on a build step.
      */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/portfolio.css" />
      {fontsHref ? <link rel="stylesheet" href={fontsHref} /> : null}
      <style>{`body{background:${doc.theme.palette.bg};margin:0}`}</style>
      <Portfolio doc={doc} staticMode={!doc.site.scrollAnimations} />
    </>
  );
}

export default function ViewPage() {
  return (
    <Suspense fallback={<div className="h-dvh" />}>
      <Viewer />
    </Suspense>
  );
}
