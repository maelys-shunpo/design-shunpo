"use client";

import { type ComponentProps, type SyntheticEvent, useState } from "react";

import { AgentsAction } from "./action.tsx";
import { Chip } from "./chip.tsx";
import { type ComposerScenario, ComposerPlan } from "./composer-plan.tsx";
import { TextField } from "./text-field.tsx";

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
      <TextField
        label={label}
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
        }}
        placeholder={placeholder}
      />
      <AgentsAction render={renderSubmit} size="lg">
        {submit}
      </AgentsAction>
    </form>
  );
}

/* The action rendered as the form's submit button; its label comes from the action's children. */
function renderSubmit(props: ComponentProps<"button">) {
  return <button type="submit" {...props} />;
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
          <Chip
            type="button"
            onClick={() => {
              onPick(scenario);
            }}
          >
            {scenario.label}
          </Chip>
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
      className="flex flex-col gap-4 rounded-surface border border-agents-line bg-surface p-4 text-agents-ink shadow-agents-float md:p-6"
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
            <span className="self-end rounded-surface bg-agents-ink px-4 py-3 text-sm text-agents-paper">
              {asked.scenario.request}
            </span>
            <ComposerPlan key={asked.turn} scenario={asked.scenario} humanLabel={humanLabel} />
          </>
        )}
      </output>
    </div>
  );
}
