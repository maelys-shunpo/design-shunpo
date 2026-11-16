"use client";

import { useEffect, useState } from "react";

import { cn } from "../lib/cn.ts";

export interface PlanStep {
  tool: string;
  action: string;
}

export interface ComposerScenario {
  id: string;
  label: string;
  keywords: string[];
  request: string;
  title: string;
  steps: PlanStep[];
  /* What stays with a person. */
  human: string;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const STEP_EVERY_MS = 520;

type EffectCleanup = (() => void) | undefined;

/* How many steps show: all at once under reduced motion, one by one otherwise. Remount it to start again. */
function useRevealed(total: number): number {
  const [shown, setShown] = useState(0);
  useEffect((): EffectCleanup => {
    const instant = window.matchMedia(REDUCED_MOTION).matches;
    const timer = window.setInterval(
      () => {
        setShown((count) => (instant ? total : Math.min(count + 1, total)));
      },
      instant ? 0 : STEP_EVERY_MS,
    );
    return () => {
      window.clearInterval(timer);
    };
  }, [total]);
  return shown;
}

/* The agent's answer to a task: a plan written step by step, the tools it would use, what stays human. */
export function ComposerPlan({
  scenario,
  humanLabel,
}: {
  scenario: ComposerScenario;
  humanLabel: string;
}) {
  const shown = useRevealed(scenario.steps.length + 1);
  return (
    <div data-slot="composer-plan" className="flex flex-col gap-4 border-y border-agents-line py-4">
      <span className="flex items-center gap-2 text-sm font-medium">
        <span aria-hidden className="size-2 bg-agents-signal" />
        {scenario.title}
      </span>
      <ol className="flex flex-col gap-2">
        {scenario.steps.map((step, index) => (
          <li
            key={step.action}
            className={cn(
              "flex items-baseline gap-3 transition-opacity duration-300",
              index < shown ? "opacity-100" : "opacity-0",
            )}
          >
            <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
              <span className="text-sm">{step.action}</span>
              <span className="font-mono text-xs text-muted-foreground">{step.tool}</span>
            </span>
          </li>
        ))}
      </ol>
      <p
        className={cn(
          "bg-agents-wait-tint px-3 py-2 text-sm text-agents-ink transition-opacity duration-300",
          shown > scenario.steps.length ? "opacity-100" : "opacity-0",
        )}
      >
        <span className="font-medium text-agents-wait">{humanLabel} </span>
        {scenario.human}
      </p>
    </div>
  );
}
