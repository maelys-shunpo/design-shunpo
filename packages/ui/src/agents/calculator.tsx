"use client";

import type { ComponentProps, ReactNode } from "react";

import { cn } from "../lib/cn.ts";
import { AgentsAction } from "./action.tsx";
import type { CalculatorModel, CalculatorQuestion } from "./calculator-model.ts";
import { CalculatorResult } from "./calculator-result.tsx";
import { Chip } from "./chip.tsx";
import { type Calculator as Flow, useCalculator } from "./use-calculator.ts";

interface CalculatorProps {
  model: CalculatorModel;
  /* Shown once above the five timed tasks: « Par personne et par semaine, combien de temps pour… ». */
  hoursLeadIn: string;
  /* The call toward the detailed report, placed on the result screen. */
  reportCta: ReactNode;
  className?: string | undefined;
}

function Progress({ position, total }: { position: number; total: number }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">{`Question ${String(position)} / ${String(total)}`}</p>
      <span aria-hidden className="block h-0.5 overflow-clip bg-agents-line">
        <span
          className="block size-full origin-left bg-tenku transition-transform duration-200 ease-linear"
          style={{ transform: `scaleX(${String(position / total)})` }}
        />
      </span>
    </div>
  );
}

function Options({
  question,
  values,
  onChoose,
}: {
  question: CalculatorQuestion;
  values: string[];
  onChoose: (value: string) => void;
}) {
  return (
    <ul aria-label={question.prompt} className="flex flex-wrap gap-2">
      {question.options.map((option) => (
        <li key={option.value}>
          <Chip
            type="button"
            aria-pressed={values.includes(option.value)}
            onClick={() => {
              onChoose(option.value);
            }}
          >
            {option.label}
          </Chip>
        </li>
      ))}
    </ul>
  );
}

function Question({
  flow,
  question,
  leadIn,
}: {
  flow: Flow;
  question: CalculatorQuestion;
  leadIn: string | undefined;
}) {
  return (
    <div className="flex flex-col gap-4">
      {leadIn === undefined ? null : <p className="text-sm text-muted-foreground">{leadIn}</p>}
      <p className="text-lg font-medium text-foreground">{question.prompt}</p>
      <Options
        question={question}
        values={flow.answers[question.id] ?? []}
        onChoose={flow.choose}
      />
      {question.kind === "multi" ? (
        <p className="text-xs text-muted-foreground">Plusieurs réponses possibles.</p>
      ) : null}
    </div>
  );
}

function renderButton(props: ComponentProps<"button">) {
  return <button type="button" {...props} />;
}

function Nav({ flow }: { flow: Flow }) {
  const last = flow.position === flow.total;
  return (
    <div className="flex items-center justify-between gap-4">
      <AgentsAction
        render={renderButton}
        variant="quiet"
        size="md"
        aria-disabled={flow.position === 1}
        onClick={flow.back}
      >
        Retour
      </AgentsAction>
      <AgentsAction
        render={renderButton}
        variant="signal"
        size="md"
        aria-disabled={!flow.answered}
        onClick={() => {
          if (flow.answered) {
            flow.next();
          }
        }}
      >
        {last ? "Voir le résultat" : "Continuer"}
      </AgentsAction>
    </div>
  );
}

function Body({
  flow,
  model,
  hoursLeadIn,
  reportCta,
}: {
  flow: Flow;
  model: CalculatorModel;
  hoursLeadIn: string;
  reportCta: ReactNode;
}) {
  if (flow.atResult) {
    return (
      <CalculatorResult
        result={flow.result}
        hourly={flow.hourly}
        onHourly={flow.setHourly}
        onRestart={flow.restart}
        cta={reportCta}
      />
    );
  }

  if (flow.question === undefined) {
    return null;
  }

  const timed = model.tasks.some((task) => task.question === flow.question?.id);
  return (
    <>
      <Progress position={flow.position} total={flow.total} />
      <Question flow={flow} question={flow.question} leadIn={timed ? hoursLeadIn : undefined} />
      <Nav flow={flow} />
    </>
  );
}

/* The lost-hours calculator: one question a screen on a cut sheet, then the result. No server. */
export function Calculator({ model, hoursLeadIn, reportCta, className }: CalculatorProps) {
  const flow = useCalculator(model);

  return (
    <div
      data-slot="calculator"
      className={cn("agents-sheet flex flex-col gap-8 p-6 agents-sheet-lift md:p-8", className)}
    >
      <Body flow={flow} model={model} hoursLeadIn={hoursLeadIn} reportCta={reportCta} />
    </div>
  );
}
