"use client";

import { useCallback, useMemo, useState } from "react";

import {
  type CalculatorAnswers,
  type CalculatorModel,
  type CalculatorQuestion,
  type CalculatorResult,
  clampHourly,
  resultOf,
} from "./calculator-model.ts";

/* The default hourly cost the brief sets, before the visitor moves the dial. */
const DEFAULT_HOURLY = 33;

export interface Calculator {
  /* The question the visitor is on, or `undefined` once past the last one. */
  question: CalculatorQuestion | undefined;
  /* Its 1-based place and the count, for « Question 5 / 11 ». */
  position: number;
  total: number;
  answers: CalculatorAnswers;
  hourly: number;
  atResult: boolean;
  /* Whether the current question holds at least one answer. */
  answered: boolean;
  result: CalculatorResult;
  /* Picks a value: a single question keeps one, a multi one toggles. */
  choose: (value: string) => void;
  next: () => void;
  back: () => void;
  setHourly: (value: number) => void;
  restart: () => void;
}

function toggle(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((kept) => kept !== value) : [...values, value];
}

/* Drives the lost-hours calculator: one question a screen, back and forth, then the result.
   The figures come from the pure model; this only tracks where the visitor is and what they chose. */
export function useCalculator(model: CalculatorModel): Calculator {
  const total = model.questions.length;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<CalculatorAnswers>({});
  const [hourly, setHourlyState] = useState(DEFAULT_HOURLY);

  const atResult = step >= total;
  const question = atResult ? undefined : model.questions[step];
  const answered = question !== undefined && (answers[question.id]?.length ?? 0) > 0;

  const result = useMemo(() => resultOf(model, answers, hourly), [model, answers, hourly]);

  const choose = useCallback(
    (value: string) => {
      if (question === undefined) {
        return;
      }
      setAnswers((previous) => {
        const current = previous[question.id] ?? [];
        const nextValues = question.kind === "multi" ? toggle(current, value) : [value];
        return { ...previous, [question.id]: nextValues };
      });
    },
    [question],
  );

  const next = useCallback(() => {
    setStep((previous) => Math.min(previous + 1, total));
  }, [total]);

  const back = useCallback(() => {
    setStep((previous) => Math.max(previous - 1, 0));
  }, []);

  const setHourly = useCallback((value: number) => {
    setHourlyState(clampHourly(value));
  }, []);

  const restart = useCallback(() => {
    setStep(0);
    setAnswers({});
    setHourlyState(DEFAULT_HOURLY);
  }, []);

  return {
    question,
    position: Math.min(step + 1, total),
    total,
    answers,
    hourly,
    atResult,
    answered,
    result,
    choose,
    next,
    back,
    setHourly,
    restart,
  };
}
