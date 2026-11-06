"use client";

import { type SyntheticEvent, useState } from "react";

import { type ComposerScenario, ComposerPlan } from "./composer-plan.tsx";

interface TaskComposerProps {
  scenarios: ComposerScenario[];
  /* Answer when no scenario matches what the visitor typed. */
  fallback: ComposerScenario;
  label: string;
  placeholder: string;
  submit: string;
  humanLabel: string;
}

function match(
  text: string,
  scenarios: ComposerScenario[],
  fallback: ComposerScenario,
): ComposerScenario {
  const words = text.toLowerCase();
  const found = scenarios.find((scenario) =>
    scenario.keywords.some((keyword) => words.includes(keyword)),
  );
  return { ...(found ?? fallback), request: text };
}

interface ComposerFormProps {
  label: string;
  placeholder: string;
  submit: string;
  onAsk: (text: string) => void;
}

function ComposerForm({ label, placeholder, submit, onAsk }: ComposerFormProps) {
  const [draft, setDraft] = useState("");
  function onSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    const text = draft.trim();
    if (text === "") {
      return;
    }
    onAsk(text);
    setDraft("");
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
      <label className="flex flex-1 flex-col">
        <span className="sr-only">{label}</span>
        <input
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
          placeholder={placeholder}
          className="h-12 w-full rounded-lg border border-agents-line bg-agents-paper px-4 text-md placeholder:text-muted-foreground"
        />
      </label>
      <button
        type="submit"
        className="h-12 shrink-0 cursor-pointer rounded-lg bg-agents-ink px-5 text-md font-medium text-agents-paper hover:bg-agents-ink/85"
      >
        {submit}
      </button>
    </form>
  );
}

function ComposerChips({
  scenarios,
  onPick,
}: {
  scenarios: ComposerScenario[];
  onPick: (scenario: ComposerScenario) => void;
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {scenarios.map((scenario) => (
        <li key={scenario.id}>
          <button
            type="button"
            onClick={() => {
              onPick(scenario);
            }}
            className="inline-flex min-h-8 cursor-pointer items-center rounded-full border border-agents-line px-3 text-sm text-muted-foreground transition-colors duration-200 hover:border-agents-ink hover:text-agents-ink"
          >
            {scenario.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

/* A live try-out: the visitor names a task, the agent answers with the plan it would follow. Scripted, no server. */
export function TaskComposer({
  scenarios,
  fallback,
  label,
  placeholder,
  submit,
  humanLabel,
}: TaskComposerProps) {
  const [asked, setAsked] = useState<{ scenario: ComposerScenario; turn: number } | null>(null);
  function ask(scenario: ComposerScenario): void {
    setAsked({ scenario, turn: (asked?.turn ?? 0) + 1 });
  }
  return (
    <div
      data-slot="task-composer"
      className="flex flex-col gap-4 rounded-2xl border border-agents-line bg-surface p-4 text-agents-ink shadow-agents-float md:p-6"
    >
      <ComposerForm
        label={label}
        placeholder={placeholder}
        submit={submit}
        onAsk={(text) => {
          ask(match(text, scenarios, fallback));
        }}
      />
      <ComposerChips scenarios={scenarios} onPick={ask} />
      <output aria-live="polite" className="flex flex-col gap-3">
        {asked === null ? null : (
          <>
            <span className="self-end rounded-2xl bg-agents-ink px-4 py-3 text-sm text-agents-paper">
              {asked.scenario.request}
            </span>
            <ComposerPlan key={asked.turn} scenario={asked.scenario} humanLabel={humanLabel} />
          </>
        )}
      </output>
    </div>
  );
}
