"use client";

import { cva } from "class-variance-authority";
import { Pause, Play } from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";

import { cn } from "../lib/cn.ts";
import { useArrival } from "./use-arrival.ts";
import { useAutoAdvance } from "./use-auto-advance.ts";

type PageState = "current" | "leaving" | "waiting";

/* The shown pair lands on top of the others: the pair it replaces sinks and fades first, then each card comes down
   from a step above and settles, the second a beat after the first (`agents-landing`). The others wait in the air, out
   of sight. Reduced motion swaps them at once. Three quarters wide on tablets, so a quote keeps a reading measure. */
const pairVariants = cva("col-start-1 row-start-1 flex flex-col gap-6", {
  variants: {
    state: {
      current: "z-10",
      leaving: "",
      waiting: "",
    },
  },
});

const dotVariants = cva("block h-2 rounded-full transition-all duration-300", {
  variants: {
    current: {
      true: "w-6 bg-agents-ink",
      false: "w-2 bg-agents-line group-hover/dot:bg-muted-foreground",
    },
  },
});

function pairsOf(cards: ReactNode[]) {
  return Array.from({ length: Math.ceil(cards.length / 2) }, (_, index) =>
    cards.slice(index * 2, index * 2 + 2),
  );
}

/* Until the cascade arrives in view, even the current pair waits in the air. */
function stateOf(
  index: number,
  {
    current,
    previous,
    arrived,
  }: { current: number; previous?: number | undefined; arrived: boolean },
): PageState {
  if (index === current) {
    return arrived ? "current" : "waiting";
  }
  return index === previous ? "leaving" : "waiting";
}

interface Labels {
  /* Names each pair's control, in order: « Avis 1 et 2 ». */
  pages: readonly string[];
  pause: string;
  play: string;
}

function Controls({
  pages,
  current,
  paused,
  labels,
  onShow,
  onToggle,
}: {
  pages: number;
  current: number;
  paused: boolean;
  labels: Labels;
  onShow: (page: number) => void;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onToggle}
        aria-label={paused ? labels.play : labels.pause}
        className="grid size-8 cursor-pointer place-items-center rounded-full border border-agents-line bg-surface text-agents-ink transition-colors hover:border-agents-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {paused ? (
          <Play aria-hidden className="size-3" />
        ) : (
          <Pause aria-hidden className="size-3" />
        )}
      </button>
      <div className="flex items-center">
        {Array.from({ length: pages }, (_, page) => (
          <button
            key={page}
            type="button"
            onClick={() => {
              onShow(page);
            }}
            aria-label={labels.pages[page] ?? String(page + 1)}
            aria-current={page === current ? "true" : undefined}
            className="group/dot grid size-6 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-ring"
          >
            <span aria-hidden className={dotVariants({ current: page === current })} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* Every pair in one place, only the current one read and reachable. */
function Pairs({
  pairs,
  current,
  previous,
  arrived,
}: {
  pairs: ReactNode[][];
  current: number;
  previous: number | undefined;
  arrived: boolean;
}) {
  return (
    <div className="grid">
      {pairs.map((cards, index) => {
        const state = stateOf(index, { current, previous, arrived });
        const shown = index === current;
        return (
          <ul
            // eslint-disable-next-line react/no-array-index-key -- a pair is its place in the loop.
            key={index}
            aria-hidden={shown ? undefined : true}
            tabIndex={shown ? undefined : -1}
            inert={!shown}
            className={pairVariants({ state })}
          >
            {cards.map((card, position) => (
              <li
                // eslint-disable-next-line react/no-array-index-key -- a card is its place in the pair.
                key={position}
                data-state={state}
                className="agents-landing md:w-3/4 md:even:self-end lg:w-5/6"
              >
                <span aria-hidden data-landing="shadow">
                  <span />
                </span>
                <div data-landing="card">{card}</div>
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}

interface TestimonialCascadeProps {
  /* Testimonial cards, in reading order: shown two by two. */
  children: ReactNode[];
  label: string;
  labels: Labels;
  /* Milliseconds each pair stays. */
  every?: number;
  className?: string | undefined;
}

/* The clients' words two by two, stepping from one edge to the other from tablets up, the pairs landing in turn in a
   loop: the first pair lands as the cascade comes into view (as painted if it already was), the loop is held off
   screen, under the pointer, paused at will, and never runs on its own under reduced motion. */
export function TestimonialCascade({
  children,
  label,
  labels,
  every = 7000,
  className,
}: TestimonialCascadeProps) {
  const pairs = pairsOf(children);
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [page, setPage] = useState<{ current: number; previous?: number }>({ current: 0 });
  const show = useCallback((next: number) => {
    setPage((shown) =>
      next === shown.current ? shown : { current: next, previous: shown.current },
    );
  }, []);
  const arrived = useArrival(root);
  const { current } = page;
  const advance = useCallback(() => {
    show((current + 1) % pairs.length);
  }, [current, pairs.length, show]);
  useAutoAdvance({ root, count: paused || !arrived ? 0 : pairs.length, every, advance });

  return (
    <section
      ref={setRoot}
      data-slot="testimonial-cascade"
      aria-label={label}
      className={cn("flex flex-col gap-6", className)}
    >
      <Pairs pairs={pairs} current={page.current} previous={page.previous} arrived={arrived} />
      {pairs.length > 1 ? (
        <Controls
          pages={pairs.length}
          current={page.current}
          paused={paused}
          labels={labels}
          onShow={show}
          onToggle={() => {
            setPaused((value) => !value);
          }}
        />
      ) : null}
    </section>
  );
}
