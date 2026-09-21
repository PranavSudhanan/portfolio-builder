"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

/**
 * The builder route.
 *
 * Rendered client-only: the workspace reads projects from localStorage, which
 * does not exist on the server, so prerendering it would only produce markup
 * that is immediately thrown away.
 */
const BuilderWorkspace = dynamic(() => import("@/components/builder/BuilderWorkspace"), {
  ssr: false,
  loading: () => <Loading />,
});

function Loading() {
  return (
    <div className="grid h-dvh place-items-center bg-[var(--color-ink)]">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-[var(--color-edge)] border-t-[var(--color-brand)]" />
        <p className="text-[13px] text-[var(--color-faint)]">Loading your workspace…</p>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<Loading />}>
      <BuilderWorkspace />
    </Suspense>
  );
}
