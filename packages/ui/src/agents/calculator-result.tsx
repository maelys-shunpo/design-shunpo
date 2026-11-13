"use client";

import { Slider } from "@base-ui/react/slider";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "../lib/cn.ts";
import { AgentsAction } from "./action.tsx";
import type { CalculatorResult as Result } from "./calculator-model.ts";

function renderButton(props: ComponentProps<"button">) {
  return <button type="button" {...props} />;
}

const euros = new Intl.NumberFormat("fr-FR");

function hours(value: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value);
}

interface CalculatorResultProps {
  result: Result;
  hourly: number;
  onHourly: (value: number) => void;
  onRestart: () => void;
  /* The call toward the detailed report; its label is « Recevoir le rapport détaillé ». */
  cta: ReactNode;
  className?: string | undefined;
}

function Figure({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-display text-3xl leading-none font-medium text-tenku lining-nums tabular-nums md:text-4xl">
        {value}
        <span className="text-xl md:text-2xl">&#8239;{unit}</span>
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function LossSentence({ result }: { result: Result }) {
  return (
    <p className="text-xl text-foreground md:text-2xl">
      Votre équipe perd environ{" "}
      <strong className="font-display font-medium text-tenku">{hours(result.weeklySpent)} h</strong>{" "}
      par semaine en tâches répétitives. Environ{" "}
      <strong className="font-display font-medium text-tenku">
        {hours(result.weeklyRecoverable)} h
      </strong>{" "}
      sont récupérables.
    </p>
  );
}

function Figures({ result }: { result: Result }) {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <Figure value={hours(result.yearlyHours)} unit="h/an" label="récupérables" />
      <Figure value={euros.format(result.yearlyCost)} unit="€/an" label="à ce coût horaire" />
      <Figure
        value={result.fullTime.toLocaleString("fr-FR")}
        unit="temps plein"
        label="équivalent"
      />
    </div>
  );
}

function HourlyDial({ hourly, onHourly }: { hourly: number; onHourly: (value: number) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">{`Coût horaire chargé : ${String(hourly)} €`}</span>
        <span className="text-xs text-muted-foreground">25 à 45 €</span>
      </div>
      <Slider.Root
        value={hourly}
        min={25}
        max={45}
        step={1}
        onValueChange={(value: number | readonly number[]) => {
          onHourly(typeof value === "number" ? value : (value[0] ?? hourly));
        }}
      >
        <Slider.Control className="flex h-6 w-full items-center">
          <Slider.Track className="h-0.5 w-full bg-agents-line">
            <Slider.Indicator className="bg-tenku" />
            <Slider.Thumb
              aria-label="Coût horaire chargé en euros"
              className="size-4 bg-tenku focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </div>
  );
}

function Sources({ result }: { result: Result }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display text-xl font-medium text-foreground">
        Vos trois plus gros gisements
      </h3>
      <ol className="flex flex-col">
        {result.sources.map((source) => (
          <li
            key={source.title}
            className="flex items-baseline justify-between gap-4 border-b border-agents-line py-3 last:border-b-0"
          >
            <span className="text-foreground">{source.title}</span>
            <span className="font-display font-medium whitespace-nowrap text-tenku lining-nums tabular-nums">
              {hours(source.weeklyHours)} h/sem
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Method() {
  return (
    <details className="flex flex-col gap-2 text-sm text-muted-foreground">
      <summary className="cursor-pointer text-foreground">Comment on calcule</summary>
      <p>
        Pour chaque tâche, on applique un taux d’automatisation prudent au temps que vous déclarez,
        multiplié par la taille de l’équipe, sur 45 semaines travaillées. Le coût part de votre
        curseur, l’équivalent temps plein d’une durée légale de 1 607 h. Les chiffres sont arrondis
        vers le bas.
      </p>
      <p>
        Estimation basée sur vos réponses. Seule une observation sur le terrain permet un chiffrage
        précis.
      </p>
    </details>
  );
}

/* The implausible-answers guard: the brief's message instead of an aberrant figure, with a way back. */
function Guard({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <p className="text-lg text-foreground">
        Vos réponses représentent presque tout le temps de travail de l’équipe. Reprenez-les pour un
        chiffre que vous pourrez défendre.
      </p>
      <AgentsAction render={renderButton} variant="outline" size="md" onClick={onRestart}>
        Revoir mes réponses
      </AgentsAction>
    </div>
  );
}

/* The result screen: the loss first, then what is recoverable, three figures, the hourly dial the
   visitor sets, the three biggest time sources, and the method laid open. */
export function CalculatorResult({
  result,
  hourly,
  onHourly,
  onRestart,
  cta,
  className,
}: CalculatorResultProps) {
  if (result.implausible) {
    return (
      <div data-slot="calculator-result" className={cn("flex flex-col", className)}>
        <Guard onRestart={onRestart} />
      </div>
    );
  }

  return (
    <div data-slot="calculator-result" className={cn("flex flex-col gap-8", className)}>
      <LossSentence result={result} />
      <Figures result={result} />
      <HourlyDial hourly={hourly} onHourly={onHourly} />
      <Sources result={result} />
      <Method />
      <div className="flex flex-wrap items-center gap-4">
        {cta}
        <AgentsAction render={renderButton} variant="quiet" size="md" onClick={onRestart}>
          Recommencer
        </AgentsAction>
      </div>
    </div>
  );
}
