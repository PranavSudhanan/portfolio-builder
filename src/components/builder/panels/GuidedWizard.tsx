"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { ChipSelect, FieldGroup, SelectField, TextField } from "@/components/ui/Field";
import { createDoc } from "@/lib/defaults";
import { EXPERIENCE_BANDS, ROLES, buildSummary, getRole } from "@/lib/guided";
import { useBuilder } from "@/lib/store";
import type { Item } from "@/lib/types";
import { uid } from "@/lib/utils";

/**
 * The guided builder.
 *
 * Collects the few facts only the person knows — name, role, dates — and offers
 * everything else as choices drawn from `lib/guided.ts`. Suggestions are curated
 * per role family, not generated: it will never invent a job someone did not do,
 * and every answer lands in the normal editor afterwards.
 */

interface Answers {
  roleId: string;
  name: string;
  title: string;
  band: string;
  location: string;
  email: string;
  skills: string[];
  strengths: string[];
  degree: string;
  institution: string;
  gradYear: string;
  jobTitle: string;
  company: string;
  jobPeriod: string;
  achievements: string[];
}

const EMPTY: Answers = {
  roleId: "developer",
  name: "",
  title: "",
  band: "3",
  location: "",
  email: "",
  skills: [],
  strengths: [],
  degree: "",
  institution: "",
  gradYear: "",
  jobTitle: "",
  company: "",
  jobPeriod: "",
  achievements: [],
};

const STEPS = ["Role", "About you", "Skills", "Strengths", "Education", "Experience"] as const;

export function GuidedWizard({ onDone }: { onDone: () => void }) {
  const { doc, replaceDoc } = useBuilder();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY);

  const role = getRole(answers.roleId);
  const set = <K extends keyof Answers>(key: K, value: Answers[K]) =>
    setAnswers((current) => ({ ...current, [key]: value }));

  /** Toggle one option in a multi-select answer, always from the latest state. */
  const toggle = (key: "skills" | "strengths" | "achievements", option: string) =>
    setAnswers((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(option) ? list.filter((v) => v !== option) : [...list, option],
      };
    });

  function build() {
    const fresh = createDoc(role.presetId, doc.name);
    fresh.id = doc.id;
    fresh.createdAt = doc.createdAt;

    const title = answers.title || role.titles[1] || role.label;
    fresh.profile.name = answers.name.trim();
    fresh.profile.headline = title;
    fresh.profile.email = answers.email.trim();
    fresh.profile.location = answers.location.trim();
    fresh.profile.tagline = buildSummary(role, {
      title,
      band: answers.band,
      skills: answers.skills,
      strengths: answers.strengths,
    });

    const summary = fresh.profile.tagline;
    const about = fresh.sections.find((s) => s.type === "about");
    if (about) about.body = summary;
    fresh.resume.summary = summary;

    // Skills arrive grouped the way they were offered, which keeps the grouped
    // layouts meaningful instead of dumping one long list.
    const skills = fresh.sections.find((s) => s.type === "skills");
    if (skills && answers.skills.length > 0) {
      const groups: Item[] = role.skillGroups
        .map((group) => ({
          id: uid("it"),
          title: group.label,
          items: group.options
            .filter((option) => answers.skills.includes(option))
            .map((option) => ({ id: uid("it"), title: option, level: 75 })),
        }))
        .filter((group) => (group.items?.length ?? 0) > 0);
      if (answers.strengths.length > 0) {
        groups.push({
          id: uid("it"),
          title: "Strengths",
          items: answers.strengths.map((s) => ({ id: uid("it"), title: s, level: 80 })),
        });
      }
      skills.items = groups;
      skills.variant = "grouped";
    }

    const education = fresh.sections.find((s) => s.type === "education");
    if (education && (answers.degree || answers.institution)) {
      education.items = [
        {
          id: uid("it"),
          title: answers.degree || "Degree",
          subtitle: answers.institution || undefined,
          period: answers.gradYear || undefined,
        },
      ];
    }

    const experience = fresh.sections.find((s) => s.type === "experience");
    if (experience && (answers.jobTitle || answers.company)) {
      experience.items = [
        {
          id: uid("it"),
          title: answers.jobTitle || title,
          subtitle: answers.company || undefined,
          period: answers.jobPeriod || undefined,
          bullets: answers.achievements.length > 0 ? answers.achievements : undefined,
          tags: answers.skills.slice(0, 5),
        },
      ];
    } else if (experience && answers.band === "0") {
      // Nothing to show yet, and an empty Experience block reads worse than none.
      experience.enabled = false;
    }

    replaceDoc(fresh);
    onDone();
  }

  const canAdvance =
    step !== 1 || Boolean(answers.name.trim());

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className="h-1 flex-1 rounded-full transition-colors"
              style={{ background: i <= step ? "var(--color-brand)" : "var(--color-edge)" }}
              title={label}
            />
          ))}
        </div>
        <p className="text-[11px] text-[var(--color-faint)]">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>
      </div>

      {step === 0 ? (
        <FieldGroup title="What kind of work do you do?">
          <div className="flex flex-col gap-1.5">
            {ROLES.map((item) => (
              <button
                key={item.id}
                type="button"
                className="ui-tile p-2.5 text-left"
                data-selected={answers.roleId === item.id ? "true" : "false"}
                onClick={() => set("roleId", item.id)}
              >
                <span className="text-[13px] font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </FieldGroup>
      ) : null}

      {step === 1 ? (
        <FieldGroup title="About you">
          <TextField label="Full name" value={answers.name} onChange={(v) => set("name", v)} placeholder="Ada Lovelace" />
          <SelectField
            label="Current or target title"
            value={answers.title || role.titles[1] || role.titles[0]}
            onChange={(v) => set("title", v)}
            options={role.titles.map((t) => ({ value: t, label: t }))}
          />
          <TextField
            label="Or type your own title"
            value={answers.title}
            onChange={(v) => set("title", v)}
            placeholder={role.titles[1]}
          />
          <SelectField
            label="How long have you been working?"
            value={answers.band}
            onChange={(v) => set("band", v)}
            options={EXPERIENCE_BANDS.map((b) => ({ value: b.value, label: b.label }))}
          />
          <TextField label="Location" value={answers.location} onChange={(v) => set("location", v)} placeholder="Bengaluru, India" />
          <TextField label="Email" type="email" value={answers.email} onChange={(v) => set("email", v)} placeholder="you@example.com" />
        </FieldGroup>
      ) : null}

      {step === 2 ? (
        <FieldGroup title="Which of these do you use?">
          <p className="ui-help -mt-1">Pick everything that applies. You can add anything missing later.</p>
          {role.skillGroups.map((group) => (
            <ChipSelect
              key={group.label}
              label={group.label}
              options={group.options}
              value={answers.skills}
              onToggle={(option) => toggle("skills", option)}
            />
          ))}
        </FieldGroup>
      ) : null}

      {step === 3 ? (
        <FieldGroup title="What are you known for?">
          <p className="ui-help -mt-1">Two or three is plenty — a long list of strengths reads as none.</p>
          <ChipSelect options={role.strengths} value={answers.strengths} onToggle={(option) => toggle("strengths", option)} />
        </FieldGroup>
      ) : null}

      {step === 4 ? (
        <FieldGroup title="Education">
          <TextField label="Qualification" value={answers.degree} onChange={(v) => set("degree", v)} placeholder="B.Tech. Computer Science" />
          <TextField label="Institution" value={answers.institution} onChange={(v) => set("institution", v)} placeholder="VIT University" />
          <TextField label="Years" value={answers.gradYear} onChange={(v) => set("gradYear", v)} placeholder="2018 — 2022" />
        </FieldGroup>
      ) : null}

      {step === 5 ? (
        <FieldGroup title="Most recent role">
          <TextField label="Job title" value={answers.jobTitle} onChange={(v) => set("jobTitle", v)} placeholder={role.titles[1]} />
          <TextField label="Company" value={answers.company} onChange={(v) => set("company", v)} placeholder="Northwind Labs" />
          <TextField label="Period" value={answers.jobPeriod} onChange={(v) => set("jobPeriod", v)} placeholder="2022 — Present" />
          <ChipSelect
            label="Pick achievements to start from"
            options={role.achievements.map((a) => a.replace("{n}", "…"))}
            value={answers.achievements}
            onToggle={(option) => toggle("achievements", option)}
            help="These are templates. Replace the … with your own numbers once they are in the editor."
          />
        </FieldGroup>
      ) : null}

      <div className="flex gap-2">
        {step > 0 ? (
          <button type="button" className="ui-btn" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft size={14} />
            Back
          </button>
        ) : (
          <button type="button" className="ui-btn" onClick={onDone}>
            Cancel
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            className="ui-btn flex-1"
            data-tone="primary"
            disabled={!canAdvance}
            onClick={() => setStep((s) => s + 1)}
          >
            Continue
            <ArrowRight size={14} />
          </button>
        ) : (
          <button type="button" className="ui-btn flex-1" data-tone="primary" onClick={build}>
            <Sparkles size={14} />
            Build it
          </button>
        )}
      </div>

      {step === 1 && !canAdvance ? <p className="ui-help">Your name is the one thing this cannot guess.</p> : null}
    </div>
  );
}
