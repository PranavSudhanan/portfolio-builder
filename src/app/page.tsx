"use client";

import Link from "next/link";
import { ArrowRight, Clock, Download, Layers, Palette, Shield, Zap } from "lucide-react";
import { TemplateThumb } from "@/components/builder/TemplateThumb";
import { SavedProjects } from "@/components/SavedProjects";
import { PRESETS } from "@/lib/presets";
import { SECTION_DEFS } from "@/lib/sections";
import { TEMPLATES } from "@/lib/templates";
import { THEME_PRESETS } from "@/lib/themes";
import { Icon } from "@/renderer/icons";

const FEATURES = [
  {
    icon: Layers,
    title: `${SECTION_DEFS.length} section types`,
    body: "Experience, projects, galleries, publications, services, pricing, FAQs and more — each with several layout variants and its own options.",
  },
  {
    icon: Palette,
    title: "Themes down to the token",
    body: `${THEME_PRESETS.length} colour presets, 40 fonts, and direct control over every palette value, radius, shadow and spacing step — with a live contrast check.`,
  },
  {
    icon: Zap,
    title: "Truthful live preview",
    body: "The canvas renders inside a real iframe, so mobile and tablet previews resolve the actual breakpoints rather than faking them.",
  },
  {
    icon: Download,
    title: "One file, any host",
    body: "Export a single self-contained HTML file with styles and behaviour baked in. Netlify, GitHub Pages, S3 — no build step required.",
  },
  {
    icon: Shield,
    title: "Stays in your browser",
    body: "Projects are saved to localStorage. Share links carry the whole portfolio compressed in the URL fragment, which never reaches a server.",
  },
  {
    icon: Clock,
    title: "Undo everything",
    body: "Full undo and redo history with keyboard shortcuts, autosave, and JSON import/export so you always have a way back.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      {/* Ambient backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(760px circle at 12% 0%, rgba(90,75,240,0.07), transparent 46%)," +
            "radial-gradient(660px circle at 92% 16%, rgba(10,125,88,0.05), transparent 46%)",
        }}
      />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-[var(--color-brand)] text-[12px] font-bold text-white">
            PB
          </span>
          <span className="font-semibold">Portfolio Builder</span>
        </div>
        <Link href="/builder" className="ui-btn" data-tone="primary">
          Open builder
          <ArrowRight size={14} />
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        {/* Hero */}
        <section className="py-14 md:py-20">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-edge)] bg-[var(--color-panel)] px-3 py-1 text-[11.5px] text-[var(--color-dim)]">
            <span className="size-1.5 rounded-full bg-[var(--color-mint)]" />
            Runs entirely in your browser — no account, no upload
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
            A portfolio site that looks like{" "}
            {/*
              One accent, flat. The gradient ran indigo through blue to green,
              which put three hues and a muddy middle inside four words — and
              the green end sat oddly against everything else on the page.
            */}
            <span className="text-[var(--color-brand)]">you designed it</span>
            .
          </h1>
          <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-[var(--color-dim)]">
            Pick a template, choose a theme, arrange your sections, and export a finished site. Built for every kind of
            professional — developers, designers, photographers, doctors, academics, consultants and anyone else who
            needs a page that represents them properly.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/builder" className="ui-btn" data-tone="primary" style={{ padding: "11px 20px" }}>
              Start building
              <ArrowRight size={15} />
            </Link>
            <a href="#professions" className="ui-btn" style={{ padding: "11px 20px" }}>
              Browse starting points
            </a>
          </div>
        </section>

        <SavedProjects />

        {/* Professions */}
        <section id="professions" className="mb-20 scroll-mt-8">
          <h2 className="text-2xl font-semibold tracking-tight">Start from your profession</h2>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-dim)]">
            Each starting point picks a template, palette, font pairing and the sections that field usually needs — all
            filled with sample copy so you are editing rather than staring at an empty page.
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PRESETS.map((preset) => (
              <Link
                key={preset.id}
                href={`/builder?preset=${preset.id}`}
                className="ui-tile flex items-start gap-3 p-3.5"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--color-raised)] text-[var(--color-brand-soft)]">
                  <Icon name={preset.icon} size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-medium">{preset.label}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-[var(--color-faint)]">
                    {preset.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Templates */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold tracking-tight">{TEMPLATES.length} templates, every theme</h2>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-dim)]">
            Templates decide layout and navigation. Themes decide colour and type. They are independent, so any
            combination works — switch either one at any point without losing your content.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {TEMPLATES.map((template) => (
              <div key={template.id} className="ui-card overflow-hidden">
                <TemplateThumb id={template.id} />
                <div className="p-2.5">
                  <div className="text-[12.5px] font-medium">{template.label}</div>
                  <div className="mt-0.5 text-[11px] leading-snug text-[var(--color-faint)]">
                    {template.bestFor.join(" · ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Themes */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold tracking-tight">Colour, considered</h2>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-dim)]">
            Every preset is a full palette with contrast checked for body text. Override any value and the builder tells
            you the moment a combination drops below WCAG AA.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {THEME_PRESETS.map((preset) => (
              <div key={preset.id} className="ui-card overflow-hidden">
                <div className="flex h-16 items-stretch" style={{ background: preset.palette.bg }}>
                  <div className="flex flex-1 flex-col justify-center gap-1.5 p-2.5">
                    <div className="h-1.5 w-3/4 rounded-full" style={{ background: preset.palette.text }} />
                    <div className="h-1 w-1/2 rounded-full" style={{ background: preset.palette.muted }} />
                  </div>
                  <div className="flex w-7 flex-col">
                    <div className="flex-1" style={{ background: preset.palette.primary }} />
                    <div className="flex-1" style={{ background: preset.palette.secondary }} />
                    <div className="flex-1" style={{ background: preset.palette.accent }} />
                  </div>
                </div>
                <div className="px-2.5 py-2">
                  <div className="text-[12px] font-medium">{preset.name}</div>
                  <div className="text-[10.5px] text-[var(--color-faint)]">{preset.vibe}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold tracking-tight">What you get</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: FeatureIcon, title, body }) => (
              <div key={title} className="ui-card p-4">
                <span className="grid size-9 place-items-center rounded-lg bg-[rgba(90,75,240,0.08)] text-[var(--color-brand-soft)]">
                  <FeatureIcon size={17} />
                </span>
                <h3 className="mt-3 text-[14px] font-semibold">{title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--color-dim)]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="ui-card flex flex-col items-center gap-4 p-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Ready in about ten minutes</h2>
          <p className="max-w-lg text-[14px] text-[var(--color-dim)]">
            Nothing to install, no account to create. Start from a preset and swap in your own words.
          </p>
          <Link href="/builder" className="ui-btn" data-tone="primary" style={{ padding: "11px 22px" }}>
            Start building
            <ArrowRight size={15} />
          </Link>
        </section>
      </main>

      <footer className="border-t border-[var(--color-edge)] py-6">
        <div className="mx-auto max-w-6xl px-6 text-[12px] text-[var(--color-faint)]">
          Portfolio Builder — your data stays in this browser.
        </div>
      </footer>
    </div>
  );
}
