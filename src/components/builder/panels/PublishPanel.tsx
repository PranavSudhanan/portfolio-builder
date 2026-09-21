"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Globe, Loader2, Package } from "lucide-react";
import { zipSync, strToU8 } from "fflate";
import { FieldGroup } from "@/components/ui/Field";
import { renderPortfolioHtml, renderResumeHtml } from "@/lib/export-html";
import { useBuilder } from "@/lib/store";
import { formatBytes, slugify } from "@/lib/utils";

/**
 * Publishing.
 *
 * This builder has no server, so it cannot host anything itself. What it can do
 * is produce a folder that every static host accepts unchanged, and hand it to
 * the one-click services that take a drag-and-drop upload. That is stated
 * plainly rather than dressed up as "publishing", because the account and the
 * domain are the user's, not ours.
 */

interface Host {
  id: string;
  name: string;
  url: string;
  free: string;
  steps: string[];
  /** Accepts a drag-and-drop folder with no account set-up first. */
  instant?: boolean;
}

const HOSTS: Host[] = [
  {
    id: "netlify",
    name: "Netlify Drop",
    url: "https://app.netlify.com/drop",
    free: "Free, custom domain supported",
    instant: true,
    steps: [
      "Download the site folder below and unzip it.",
      "Open Netlify Drop and drag the unzipped folder onto the page.",
      "You get a live URL within seconds. Sign in afterwards to keep it and add a domain.",
    ],
  },
  {
    id: "cloudflare",
    name: "Cloudflare Pages",
    url: "https://pages.cloudflare.com/",
    free: "Free, unlimited bandwidth",
    instant: true,
    steps: [
      "Create a project and choose “Direct Upload”.",
      "Upload the unzipped folder.",
      "Set a custom domain from the project settings if you have one.",
    ],
  },
  {
    id: "github",
    name: "GitHub Pages",
    url: "https://github.com/new",
    free: "Free on public repositories",
    steps: [
      "Create a repository named <username>.github.io.",
      "Upload index.html (and resume.html) to the repository root.",
      "In Settings → Pages, set the source to the main branch.",
      "Your site appears at https://<username>.github.io within a minute or two.",
    ],
  },
  {
    id: "vercel",
    name: "Vercel",
    url: "https://vercel.com/new",
    free: "Free for personal projects",
    steps: [
      "Push the folder to a Git repository.",
      "Import it on Vercel and accept the defaults — there is nothing to build.",
      "Add your domain under the project's Domains tab.",
    ],
  },
];

export function PublishPanel() {
  const { doc } = useBuilder();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [openHost, setOpenHost] = useState<string | null>("netlify");
  const [copied, setCopied] = useState("");

  const baseName = slugify(doc.profile.name || doc.name || "portfolio");

  /** Build a deploy-ready folder: index.html, the résumé, and a readme. */
  async function downloadBundle() {
    setBusy(true);
    setStatus("");
    try {
      const [portfolio, resume] = await Promise.all([renderPortfolioHtml(doc), renderResumeHtml(doc)]);
      const readme = [
        `# ${doc.profile.name || "Portfolio"}`,
        "",
        "A static site. There is nothing to build and no dependencies to install.",
        "",
        "- `index.html` — the portfolio",
        "- `resume.html` — the résumé",
        "",
        "Upload this folder to any static host (Netlify, Cloudflare Pages, GitHub Pages, Vercel, S3).",
        "",
        `Generated ${new Date().toISOString().slice(0, 10)}.`,
      ].join("\n");

      const zipped = zipSync({
        "index.html": strToU8(portfolio),
        "resume.html": strToU8(resume),
        "README.md": strToU8(readme),
      });

      // `zipSync` hands back a view into a larger buffer; slice it so the Blob
      // carries only this archive's bytes.
      const bytes = zipped.slice();
      const url = URL.createObjectURL(new Blob([bytes as unknown as BlobPart], { type: "application/zip" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${baseName}-site.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus(`Downloaded ${baseName}-site.zip (${formatBytes(bytes.length)}). Unzip it before uploading.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not build the bundle.");
    } finally {
      setBusy(false);
    }
  }

  async function copySteps(host: Host) {
    try {
      await navigator.clipboard.writeText(`${host.name}\n${host.url}\n\n${host.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`);
      setCopied(host.id);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      setStatus("Clipboard access was blocked.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup title="1 · Get the site folder">
        <button type="button" className="ui-btn w-full justify-start" data-tone="primary" onClick={downloadBundle} disabled={busy}>
          {busy ? <Loader2 size={15} className="ui-spin" /> : <Package size={15} />}
          {busy ? "Building…" : "Download deploy bundle (.zip)"}
        </button>
        <p className="ui-help -mt-1">
          Contains <code>index.html</code>, <code>resume.html</code> and a short readme. No build step, no dependencies —
          every static host serves it as-is.
        </p>
        {status ? (
          <p className="rounded-lg border border-[var(--color-mint)]/35 bg-[var(--color-mint)]/8 p-2.5 text-[12px] text-[var(--color-mint)]">
            {status}
          </p>
        ) : null}
      </FieldGroup>

      <FieldGroup title="2 · Put it online">
        <p className="ui-help -mt-1">
          This builder runs entirely in your browser and has no server, so it cannot host the site for you. These are the
          free options that take a folder directly — the first two need no account to get a live URL.
        </p>

        <div className="flex flex-col gap-2">
          {HOSTS.map((host) => {
            const open = openHost === host.id;
            return (
              <div key={host.id} className="ui-card overflow-hidden">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 p-2.5 text-left"
                  onClick={() => setOpenHost(open ? null : host.id)}
                  aria-expanded={open}
                >
                  <Globe size={14} className="shrink-0 text-[var(--color-brand-soft)]" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium">{host.name}</span>
                    <span className="block text-[11px] text-[var(--color-faint)]">{host.free}</span>
                  </span>
                  {host.instant ? <span className="ui-chip">No account needed</span> : null}
                </button>

                {open ? (
                  <div className="flex flex-col gap-2 border-t border-[var(--color-edge-soft)] p-2.5">
                    <ol className="flex flex-col gap-1.5">
                      {host.steps.map((stepText, i) => (
                        <li key={i} className="flex gap-2 text-[12px] text-[var(--color-dim)]">
                          <span className="shrink-0 font-mono text-[11px] text-[var(--color-faint)]">{i + 1}.</span>
                          {stepText}
                        </li>
                      ))}
                    </ol>
                    <div className="flex gap-1.5">
                      <a
                        className="ui-btn flex-1"
                        href={host.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={13} />
                        Open {host.name}
                      </a>
                      <button type="button" className="ui-btn" onClick={() => copySteps(host)} aria-label="Copy steps">
                        {copied === host.id ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </FieldGroup>

      <FieldGroup title="Custom domain">
        <p className="ui-help -mt-1">
          Every host above accepts one. Buy the domain from any registrar, then point it at the host from its dashboard —
          usually a CNAME record. Because the site is plain HTML, moving it between hosts later costs nothing.
        </p>
      </FieldGroup>
    </div>
  );
}
