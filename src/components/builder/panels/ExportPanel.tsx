"use client";

import { useRef, useState } from "react";
import { Check, Copy, Download, ExternalLink, FileJson, FileText, Link2, Printer, Upload } from "lucide-react";
import { FieldGroup } from "@/components/ui/Field";
import { normalizeDoc } from "@/lib/defaults";
import { renderPortfolioHtml, renderResumeHtml } from "@/lib/export-html";
import { shareUrl } from "@/lib/share";
import { useBuilder } from "@/lib/store";
import { storageUsage } from "@/lib/storage";
import { formatBytes, slugify } from "@/lib/utils";

type Status = { tone: "ok" | "error"; message: string } | null;

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ExportPanel() {
  const { doc, replaceDoc, outputMode } = useBuilder();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState<"html" | "link" | "resume" | "pdf" | null>(null);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  // Recomputed on every render: reading a handful of localStorage keys is cheap,
  // and it stays accurate as the document grows without an effect to sync it.
  const usage = storageUsage();

  const baseName = slugify(doc.profile.name || doc.name || "portfolio");

  function exportJson() {
    download(new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" }), `${baseName}.json`);
    setStatus({ tone: "ok", message: "Project file downloaded." });
  }

  async function exportHtml() {
    setBusy("html");
    setStatus(null);
    try {
      const html = await renderPortfolioHtml(doc);
      download(new Blob([html], { type: "text/html;charset=utf-8" }), `${baseName}.html`);
      setStatus({
        tone: "ok",
        message: `HTML file downloaded (${formatBytes(new Blob([html]).size)}). Open it in any browser, or upload it to any host.`,
      });
    } catch (error) {
      setStatus({ tone: "error", message: error instanceof Error ? error.message : "Export failed." });
    } finally {
      setBusy(null);
    }
  }

async function exportResumeHtml() {
    setBusy("resume");
    setStatus(null);
    try {
      const html = await renderResumeHtml(doc);
      download(new Blob([html], { type: "text/html;charset=utf-8" }), `${baseName}-resume.html`);
      setStatus({ tone: "ok", message: "Résumé HTML downloaded." });
    } catch (error) {
      setStatus({ tone: "error", message: error instanceof Error ? error.message : "Export failed." });
    } finally {
      setBusy(null);
    }
  }

  /**
   * Print the résumé from its own window rather than the builder's.
   *
   * Printing the app would print the editor chrome; a dedicated window carries
   * only the résumé and the `@page` rule for the chosen paper size.
   */
  async function printResume() {
    setBusy("pdf");
    setStatus(null);
    try {
      const html = await renderResumeHtml(doc, { autoPrint: true });
      const win = window.open("", "_blank", "noopener,width=900,height=1100");
      if (!win) {
        setStatus({ tone: "error", message: "Your browser blocked the print window. Allow pop-ups and try again." });
        return;
      }
      win.document.write(html);
      win.document.close();
      setStatus({
        tone: "ok",
        message: "Print dialog opened. Choose “Save as PDF”, and set margins to None if your browser adds any.",
      });
    } catch (error) {
      setStatus({ tone: "error", message: error instanceof Error ? error.message : "Could not open the print view." });
    } finally {
      setBusy(null);
    }
  }

  async function makeLink() {
    setBusy("link");
    setStatus(null);
    try {
      const url = await shareUrl(doc);
      setLink(url);
      if (url.length > 30000) {
        setStatus({
          tone: "error",
          message:
            "This link is very long — some browsers and chat apps will truncate it. Remove uploaded images to shorten it.",
        });
      }
    } catch {
      setStatus({ tone: "error", message: "Could not build a share link." });
    } finally {
      setBusy(null);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setStatus({ tone: "error", message: "Clipboard access was blocked. Select the link and copy it manually." });
    }
  }

  function importJson(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        replaceDoc(normalizeDoc(parsed), { resetHistory: true });
        setStatus({ tone: "ok", message: "Project imported." });
      } catch {
        setStatus({ tone: "error", message: "That file is not a valid project export." });
      }
    };
    reader.onerror = () => setStatus({ tone: "error", message: "Could not read that file." });
    reader.readAsText(file);
  }

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup title={outputMode === "resume" ? "Résumé" : "Portfolio"}>
        {outputMode === "resume" ? (
          <>
            <button
              type="button"
              className="ui-btn w-full justify-start"
              data-tone="primary"
              onClick={printResume}
              disabled={busy === "pdf"}
            >
              <Printer size={15} />
              {busy === "pdf" ? "Preparing…" : "Download PDF"}
            </button>
            <p className="ui-help -mt-1">
              Opens a print window sized to your chosen paper. Pick “Save as PDF” as the destination.
            </p>
            <button
              type="button"
              className="ui-btn w-full justify-start"
              onClick={exportResumeHtml}
              disabled={busy === "resume"}
            >
              <FileText size={15} />
              {busy === "resume" ? "Rendering…" : "Download résumé HTML"}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="ui-btn w-full justify-start"
              data-tone="primary"
              onClick={exportHtml}
              disabled={busy === "html"}
            >
              <FileText size={15} />
              {busy === "html" ? "Rendering…" : "Download standalone HTML"}
            </button>
            <p className="ui-help -mt-1">
              One self-contained file with the styles and behaviour baked in. Drop it on Netlify, GitHub Pages, S3, or any
              web host — no build step, no dependencies.
            </p>
            <button
              type="button"
              className="ui-btn w-full justify-start"
              onClick={() => window.open(`/view?project=${doc.id}`, "_blank", "noopener")}
            >
              <ExternalLink size={15} />
              Open a full-page preview
            </button>
          </>
        )}
      </FieldGroup>

      <FieldGroup title="Share a link">
        <button type="button" className="ui-btn w-full justify-start" onClick={makeLink} disabled={busy === "link"}>
          <Link2 size={15} />
          {busy === "link" ? "Compressing…" : "Create share link"}
        </button>
        <p className="ui-help -mt-1">
          The whole portfolio is compressed into the link itself. Nothing is uploaded and no server ever sees it —
          anyone with the link can open and copy it.
        </p>
        {link ? (
          <div className="flex flex-col gap-1.5">
            <textarea className="ui-textarea font-mono text-[11px]" readOnly value={link} rows={3} onFocus={(e) => e.target.select()} />
            <div className="flex gap-1.5">
              <button type="button" className="ui-btn flex-1" onClick={copyLink}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy link"}
              </button>
              <button type="button" className="ui-btn" onClick={() => window.open(link, "_blank", "noopener")}>
                <ExternalLink size={14} />
                Open
              </button>
            </div>
            <p className="ui-help">Link size: {formatBytes(link.length)}</p>
          </div>
        ) : null}
      </FieldGroup>

      <FieldGroup title="Project file">
        <div className="flex gap-1.5">
          <button type="button" className="ui-btn flex-1 justify-start" onClick={exportJson}>
            <FileJson size={15} />
            Export
          </button>
          <button type="button" className="ui-btn flex-1 justify-start" onClick={() => fileRef.current?.click()}>
            <Upload size={15} />
            Import
          </button>
        </div>
        <p className="ui-help -mt-1">
          A JSON backup you can re-import later or move to another browser. Importing replaces everything in the current
          project.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importJson(file);
            e.target.value = "";
          }}
        />
      </FieldGroup>

      <FieldGroup title="Storage">
        <p className="ui-help -mt-1">
          Projects are saved in this browser only — about {formatBytes(usage)} used of the roughly 5 MB browsers allow.
          Export a project file to keep a copy somewhere safe.
        </p>
        <button type="button" className="ui-btn w-full justify-start" onClick={exportJson}>
          <Download size={15} />
          Back up this project now
        </button>
      </FieldGroup>

      {status ? (
        <p
          className="ui-fade rounded-lg border p-2.5 text-[12px]"
          style={
            status.tone === "ok"
              ? { borderColor: "rgba(10,125,88,0.35)", background: "rgba(10,125,88,0.06)", color: "var(--color-mint)" }
              : { borderColor: "rgba(154,98,6,0.35)", background: "rgba(154,98,6,0.06)", color: "var(--color-amber)" }
          }
        >
          {status.message}
        </p>
      ) : null}
    </div>
  );
}
