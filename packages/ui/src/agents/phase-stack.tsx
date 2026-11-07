import type { ReactElement } from "react";

import type { AgentTab } from "./agent-tabs.tsx";

declare module "react" {
  interface CSSProperties {
    /* A card's place in the deck, from the middle (`agents-stack-card`). */
    "--agents-stack-offset"?: number;
    /* How far the deck spreads from its middle, in tabs (`agents-phase-stack`). */
    "--agents-stack-reach"?: number;
  }
}

/* What a phase delivers, as a ruled list. */
function Deliverables({ details }: { details: readonly string[] }) {
  return (
    <ul className="border-t border-border">
      {details.map((detail) => (
        <li key={detail} className="border-b border-border py-2 text-sm text-foreground">
          {detail}
        </li>
      ))}
    </ul>
  );
}

interface StackCardProps {
  item: AgentTab;
  /* Where the card rests in the deck, from the middle: its tab stays visible above the card laid on it. */
  offset: number;
  backdrop: ReactElement;
}

/* One phase as a card: a tab with its name, then its words beside its board on the photographed surface. */
function StackCard({ item, offset, backdrop }: StackCardProps) {
  return (
    <li
      data-stack-card=""
      className="flex min-w-0 agents-stack-card flex-col overflow-clip rounded-stage border border-border bg-background shadow-agents-card md:motion-safe:col-start-1 md:motion-safe:row-start-1"
      style={{ "--agents-stack-offset": offset }}
    >
      <div className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border px-5 md:px-8">
        <h3 className="font-display text-2xl text-foreground">{item.title}</h3>
        {item.kicker === undefined ? null : (
          <span className="hidden font-mono text-xs tracking-wide text-muted-foreground uppercase sm:block">
            {item.kicker}
          </span>
        )}
      </div>
      <div className="grid min-w-0 flex-1 md:grid-cols-12">
        <div className="flex flex-col justify-center gap-4 p-5 md:col-span-5 md:p-8">
          <p className="text-md text-muted-foreground">{item.description}</p>
          {item.details === undefined ? null : <Deliverables details={item.details} />}
        </div>
        <div className="relative isolate flex min-w-0 items-center p-3 sm:p-6 md:col-span-7">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 [&_img]:size-full [&_img]:object-cover"
          >
            {backdrop}
          </div>
          <div className="w-full min-w-0">{item.panel}</div>
        </div>
      </div>
    </li>
  );
}

interface PhaseStackProps {
  items: AgentTab[];
  label: string;
  /* A next/image with `fill`: the surface every board rests on. Decorative. */
  backdrop: ReactElement;
}

/* The phases as a deck: from tablets up with motion, the cards share one place and each phase is laid over the one
   before, its tab still showing, so the end of the scroll holds the whole project built layer on layer. The page's
   choreography brings each card in (`[data-stack-card]`). On phones and under reduced motion the cards follow one
   another. */
export function PhaseStack({ items, label, backdrop }: PhaseStackProps) {
  const middle = (items.length - 1) / 2;
  return (
    <ol
      aria-label={label}
      data-slot="phase-stack"
      className="flex w-full flex-col gap-6 agents-phase-stack md:motion-safe:grid md:motion-safe:gap-0"
      style={{ "--agents-stack-reach": middle }}
    >
      {items.map((item, index) => (
        <StackCard key={item.id} item={item} offset={index - middle} backdrop={backdrop} />
      ))}
    </ol>
  );
}
