"use client";

import { useState } from "react";
import {
  Download,
  Eye,
  FileText,
  Globe,
  LayoutTemplate,
  Layers,
  Palette,
  SquarePen,
  Settings,
  Type,
  User,
  Wand,
} from "lucide-react";
import { useBuilder, type PanelId } from "@/lib/store";
import { Canvas } from "./Canvas";
import { TopBar } from "./TopBar";
import { ContentPanel } from "./panels/ContentPanel";
import { ExportPanel } from "./panels/ExportPanel";
import { ProfilePanel } from "./panels/ProfilePanel";
import { SectionsPanel } from "./panels/SectionsPanel";
import { SettingsPanel } from "./panels/SettingsPanel";
import { PublishPanel } from "./panels/PublishPanel";
import { QuickStartPanel } from "./panels/QuickStartPanel";
import { ResumePanel } from "./panels/ResumePanel";
import { TemplatesPanel } from "./panels/TemplatesPanel";
import { ThemePanel } from "./panels/ThemePanel";

const PANELS: {
  id: PanelId;
  label: string;
  icon: typeof Palette;
  description: string;
  Component: () => React.ReactNode;
}[] = [
  {
    id: "start",
    label: "Start",
    icon: Wand,
    description: "Import a résumé, or answer a few questions",
    Component: QuickStartPanel,
  },
  {
    id: "templates",
    label: "Template",
    icon: LayoutTemplate,
    description: "Layout, navigation style and profession presets",
    Component: TemplatesPanel,
  },
  {
    id: "theme",
    label: "Theme",
    icon: Palette,
    description: "Colours, type, spacing and effects",
    Component: ThemePanel,
  },
  {
    id: "sections",
    label: "Sections",
    icon: Layers,
    description: "Add, reorder, hide and rename sections",
    Component: SectionsPanel,
  },
  {
    id: "resume",
    label: "Résumé",
    icon: FileText,
    description: "Résumé template, page setup and column layout",
    Component: ResumePanel,
  },
  {
    id: "content",
    label: "Content",
    icon: Type,
    description: "Edit the selected section",
    Component: ContentPanel,
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    description: "Your name, contact details and social links",
    Component: ProfilePanel,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "Metadata, navigation bar and footer",
    Component: SettingsPanel,
  },
  {
    id: "publish",
    label: "Publish",
    icon: Globe,
    description: "Get a deploy-ready folder and put it online",
    Component: PublishPanel,
  },
  {
    id: "export",
    label: "Export",
    icon: Download,
    description: "Download, share and back up",
    Component: ExportPanel,
  },
];

export function BuilderShell() {
  const { panel, setPanel, focusMode, selectedSection, outputMode } = useBuilder();

  /*
   * Below 1024px the three columns do not fit: the rail and the panel alone
   * come to 400px, so on a phone the canvas was squeezed to two pixels and you
   * were editing blind. Narrow screens show one at a time and swap between
   * them, which is the only honest way to fit an editor and its preview onto a
   * 375px screen.
   */
  const [showPreview, setShowPreview] = useState(false);

  // Template and Theme shape the web page; Résumé shapes the document. Showing
  // whichever does not apply would just be three dead controls.
  const panels = PANELS.filter((p) =>
    outputMode === "resume" ? p.id !== "templates" && p.id !== "theme" : p.id !== "resume",
  );
  const active = panels.find((p) => p.id === panel) ?? panels[0];
  const ActivePanel = active.Component;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[var(--color-ink)]">
      <TopBar />

      <div className="flex min-h-0 flex-1">
        {!focusMode ? (
          <div className={`flex min-h-0 min-w-0 flex-1 lg:flex-none ${showPreview ? "hidden lg:flex" : "flex"}`}>
            <nav
              className="flex w-[64px] shrink-0 flex-col items-center gap-1 border-r border-[var(--color-edge)] bg-[var(--color-panel)] py-2"
              aria-label="Editor panels"
            >
              {panels.map(({ id, label, icon: PanelIcon }) => {
                const isActive = panel === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPanel(id)}
                    title={label}
                    aria-current={isActive ? "page" : undefined}
                    className="flex w-[52px] flex-col items-center gap-1 rounded-lg py-2 transition-colors"
                    style={{
                      background: isActive ? "rgba(90,75,240,0.08)" : "transparent",
                      color: isActive ? "var(--color-brand-soft)" : "var(--color-faint)",
                    }}
                  >
                    <PanelIcon size={17} />
                    <span className="text-[9.5px] font-medium tracking-tight">{label}</span>
                  </button>
                );
              })}
            </nav>

            <aside className="flex min-w-0 flex-1 flex-col border-r border-[var(--color-edge)] bg-[var(--color-panel)] lg:w-[336px] lg:flex-none">
              <div className="border-b border-[var(--color-edge)] px-4 py-3">
                <h2 className="text-[14px] font-semibold">
                  {panel === "content" && selectedSection ? selectedSection.title || active.label : active.label}
                </h2>
                <p className="mt-0.5 text-[11.5px] leading-snug text-[var(--color-faint)]">{active.description}</p>
              </div>
              <div className="thin-scroll flex-1 overflow-y-auto p-4">
                <ActivePanel />
              </div>
            </aside>
          </div>
        ) : null}

        <main className={`min-w-0 flex-1 ${showPreview || focusMode ? "" : "hidden lg:block"}`}>
          <Canvas />
        </main>
      </div>

      {/* One tap between what you are changing and what it looks like. */}
      {focusMode ? null : (
        <button
          type="button"
          className="ui-btn fixed bottom-4 right-4 z-50 shadow-lg lg:hidden"
          data-tone="primary"
          onClick={() => setShowPreview((open) => !open)}
        >
          {showPreview ? <SquarePen size={15} /> : <Eye size={15} />}
          {showPreview ? "Edit" : "Preview"}
        </button>
      )}
    </div>
  );
}
