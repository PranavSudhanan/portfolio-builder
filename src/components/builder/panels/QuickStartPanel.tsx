"use client";

import { useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, Check, FileUp, Loader2, Sparkles, Wand } from "lucide-react";
import { FieldGroup } from "@/components/ui/Field";
import { applyParsedResume, describeParsed, type ApplyField } from "@/lib/apply-parsed";
import { importResumeFile, type ParsedResume } from "@/lib/import-resume";
import { useBuilder } from "@/lib/store";
import { GuidedWizard } from "./GuidedWizard";

type View = "menu" | "import" | "guided";

const CONFIDENCE_COPY: Record<ParsedResume["confidence"], { tone: string; text: string }> = {
  high: { tone: "var(--color-mint)", text: "Found a clear structure — most of this should be right." },
  medium: { tone: "var(--color-amber)", text: "Found some structure. Check the entries before applying." },
  low: {
    tone: "var(--color-rose)",
    text: "Could not find much structure. Heavily formatted or multi-column résumés often extract badly — you may be faster filling things in by hand.",
  },
};

function ImportFlow({ onBack }: { onBack: () => void }) {
  const { update } = useBuilder();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [chosen, setChosen] = useState<Set<ApplyField>>(new Set());
  const [applied, setApplied] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    setError("");
    setParsed(null);
    setApplied(false);
    try {
      const result = await importResumeFile(file);
      setParsed(result);
      setChosen(new Set(describeParsed(result).map((row) => row.field)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not read that file.");
    } finally {
      setBusy(false);
    }
  }

  const rows = parsed ? describeParsed(parsed) : [];

  return (
    <div className="flex flex-col gap-5">
      <button type="button" className="ui-btn self-start" data-tone="ghost" onClick={onBack}>
        <ArrowLeft size={14} />
        Back
      </button>

      <FieldGroup title="Upload your résumé">
        <p className="ui-help -mt-1">
          PDF, DOCX or plain text. The file is read in your browser and never uploaded anywhere.
        </p>
        <button
          type="button"
          className="ui-btn w-full justify-center py-6"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? <Loader2 size={16} className="ui-spin" /> : <FileUp size={16} />}
          {busy ? "Reading…" : "Choose a file"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,text/plain"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
        {error ? (
          <p className="flex items-start gap-1.5 rounded-lg border border-[var(--color-rose)]/35 bg-[var(--color-rose)]/8 p-2.5 text-[12px] text-[var(--color-rose)]">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            {error}
          </p>
        ) : null}
      </FieldGroup>

      {parsed ? (
        <FieldGroup title="What was found">
          <p
            className="rounded-lg border p-2.5 text-[12px]"
            style={{
              borderColor: `color-mix(in srgb, ${CONFIDENCE_COPY[parsed.confidence].tone} 35%, transparent)`,
              background: `color-mix(in srgb, ${CONFIDENCE_COPY[parsed.confidence].tone} 8%, transparent)`,
              color: CONFIDENCE_COPY[parsed.confidence].tone,
            }}
          >
            {CONFIDENCE_COPY[parsed.confidence].text}
          </p>

          {rows.length === 0 ? (
            <p className="ui-help">Nothing usable came out of that file.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {rows.map((row) => {
                const on = chosen.has(row.field);
                return (
                  <button
                    key={row.field}
                    type="button"
                    className="ui-tile flex items-start gap-2.5 p-2.5 text-left"
                    data-selected={on ? "true" : "false"}
                    onClick={() =>
                      setChosen((current) => {
                        const next = new Set(current);
                        if (next.has(row.field)) next.delete(row.field);
                        else next.add(row.field);
                        return next;
                      })
                    }
                  >
                    <span
                      className="mt-0.5 grid size-4 shrink-0 place-items-center rounded border"
                      style={{
                        borderColor: on ? "var(--color-brand)" : "var(--color-edge)",
                        background: on ? "var(--color-brand)" : "transparent",
                      }}
                    >
                      {on ? <Check size={11} className="text-white" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12.5px] font-medium">{row.label}</span>
                      <span className="block text-[11px] leading-snug text-[var(--color-faint)]">{row.detail}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <button
            type="button"
            className="ui-btn w-full"
            data-tone="primary"
            disabled={chosen.size === 0}
            onClick={() => {
              update((draft) => applyParsedResume(draft, parsed, chosen));
              setApplied(true);
            }}
          >
            Apply {chosen.size} {chosen.size === 1 ? "item" : "items"}
          </button>

          {applied ? (
            <p className="rounded-lg border border-[var(--color-mint)]/35 bg-[var(--color-mint)]/8 p-2.5 text-[12px] text-[var(--color-mint)]">
              Applied. Check the Content and Profile panels — parsing a résumé is guesswork, so a read-through is worth
              it. Undo puts everything back.
            </p>
          ) : null}

          {/*
            Showing which headings were recognised turns a silent miss into a
            visible one: if a résumé had a Projects section and it is not listed
            here, the heading was not understood, and the user can see that
            rather than wondering why their projects vanished.
          */}
          {parsed.headings.length > 0 ? (
            <div>
              <p className="ui-help">Sections recognised in your file:</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {parsed.headings.map((heading, i) => (
                  <span className="ui-chip" key={`${heading}-${i}`}>
                    {heading}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {parsed.unparsed.length > 0 ? (
            <p className="ui-help">
              {parsed.unparsed.length} line(s) could not be placed under any heading and were left out.
            </p>
          ) : null}
        </FieldGroup>
      ) : null}
    </div>
  );
}

export function QuickStartPanel() {
  const [view, setView] = useState<View>("menu");

  if (view === "import") return <ImportFlow onBack={() => setView("menu")} />;
  if (view === "guided") return <GuidedWizard onDone={() => setView("menu")} />;

  return (
    <div className="flex flex-col gap-5">
      <FieldGroup title="Start faster">
        <button type="button" className="ui-tile flex items-start gap-3 p-3" onClick={() => setView("import")}>
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--color-raised)] text-[var(--color-brand-soft)]">
            <FileUp size={17} />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-medium">Import an existing résumé</span>
            <span className="mt-0.5 block text-[11.5px] leading-snug text-[var(--color-faint)]">
              Read a PDF or DOCX and fill in your details, roles, education and skills.
            </span>
          </span>
        </button>

        <button type="button" className="ui-tile flex items-start gap-3 p-3" onClick={() => setView("guided")}>
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--color-raised)] text-[var(--color-brand-soft)]">
            <Wand size={17} />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-medium">Guided builder</span>
            <span className="mt-0.5 block text-[11.5px] leading-snug text-[var(--color-faint)]">
              Answer six short questions and get a filled-in portfolio and résumé.
            </span>
          </span>
        </button>
      </FieldGroup>

      <FieldGroup title="How these work">
        <p className="ui-help -mt-1">
          <strong className="text-[var(--color-dim)]">Import</strong> extracts the text from your file and matches it
          against common résumé headings and date formats. It is pattern matching, not comprehension, so review what it
          produces — everything it does is a single undo away.
        </p>
        <p className="ui-help">
          <strong className="text-[var(--color-dim)]">Guided builder</strong> offers skills, tools and achievement
          phrasings curated for your field and assembles what you pick. It suggests from a fixed list rather than
          generating text, so it will never put words in your mouth about work you did not do.
        </p>
        <p className="flex items-start gap-1.5 text-[11px] text-[var(--color-faint)]">
          <Sparkles size={12} className="mt-0.5 shrink-0" />
          Both run entirely offline in this browser.
        </p>
      </FieldGroup>
    </div>
  );
}
