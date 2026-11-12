"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { Fragment, type ReactElement } from "react";

import { cn } from "../lib/cn.ts";
import { RollingFigure } from "./rolling-figure.tsx";

/* The rank of a mission's word, which sets when it rises (`agents-case-word`). */
declare module "react" {
  interface CSSProperties {
    "--agents-word"?: number;
  }
}

const cardVariants = cva(
  "group/case agents-frame relative block aspect-4/5 w-full agents-frame-focus text-left agents-fold agents-frame-out md:aspect-3/4",
  {
    variants: {
      /* One tint per client: Kurenai Blush, Blue Tenku or the light Shiro (its words in ink). */
      tint: {
        kurenai: "agents-case-kurenai",
        tenku: "agents-case-tenku",
        shiro: "agents-case-shiro",
      },
    },
    defaultVariants: { tint: "tenku" },
  },
);

interface CaseCardProps extends useRender.ComponentProps<"a">, VariantProps<typeof cardVariants> {
  client: string;
  /* The client's logo, in one ink (a `next/image`, `alt=""`): it signs the card, its name read out behind it. Without
     one, the name is set like a wordmark. */
  logo?: ReactElement | undefined;
  /* The project's key figure, as its published case states it (« 1,4 » and its unit « M »), and what it measures. */
  figure: string;
  unit: string;
  figureLabel: string;
  /* What the mission was, in one sentence: it takes the figure's place under the pointer and on keyboard focus. */
  mission: string;
  /* The delivered product, the card's ground under the tint: a `next/image` from the page (`alt=""`). */
  image?: ReactElement | undefined;
  action: string;
  className?: string;
}

/* How a card is signed: the client's logo, its name read out behind it, or the name set like a wordmark. */
function signature(client: string, logo: ReactElement | undefined) {
  if (logo === undefined) {
    return (
      <span className="font-display text-2xl leading-none font-heading text-balance">{client}</span>
    );
  }
  return (
    <span className="flex h-6 items-center [&_img]:h-full [&_img]:w-auto">
      <span className="sr-only">{client}</span>
      {logo}
    </span>
  );
}

/* The mission, word by word: each word rises into focus 22 ms after the one before (`agents-case-word`). */
function words(mission: string) {
  return mission.split(" ").map((word, rank) => (
    // oxlint-disable-next-line react/no-array-index-key -- the words of one sentence are positional.
    <Fragment key={rank}>
      {rank === 0 ? null : " "}
      <span data-case-word className="agents-case-word" style={{ "--agents-word": rank }}>
        {word}
      </span>
    </Fragment>
  ));
}

/* A published reference as a card of the references wall (a gallery at night): the delivered product as the ground,
   softened under the client's tint (Kurenai Blush, Blue Tenku or Shiro), the logo at the head, the key figure and what
   it measures at the foot. Under the pointer and on keyboard focus the figure gives way to the mission, one sentence
   rising word by word, while the folded top right corner opens further (« Le pli ») and the arrow comes into it, The way to the case stays for readers (`sr-only`). */
export function CaseCard({
  client,
  logo,
  figure,
  unit,
  figureLabel,
  mission,
  image,
  action,
  tint,
  render,
  className,
  ...props
}: CaseCardProps) {
  const children = (
    <>
      <span className="absolute inset-0 overflow-clip agents-case-sheet agents-fold-paper">
        {image === undefined ? null : <span className="agents-case-ground">{image}</span>}
        <span className="agents-case-shade" />
        <span className="absolute top-6 left-6 agents-case-logo">{signature(client, logo)}</span>
        <span className="absolute inset-x-6 bottom-6 grid *:col-start-1 *:row-start-1 *:self-end">
          <span data-case-stat className="flex agents-case-stat flex-col gap-3">
            <RollingFigure figure={figure} unit={unit} size="lg" />
            <span className="text-md text-balance agents-case-label">{figureLabel}</span>
          </span>
          <span data-case-mission className="max-w-prose font-display text-xl text-pretty">
            {words(mission)}
          </span>
        </span>
        <span className="sr-only">{action}</span>
      </span>
      <span aria-hidden="true" className="agents-fold-flap">
        <span />
      </span>
      <svg
        aria-hidden="true"
        data-case-arrow
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="agents-fold-arrow"
      >
        <path d="M4 12 12 4M6 4h6v6" />
      </svg>
    </>
  );
  const ownProps = {
    "data-slot": "case-card",
    className: cn(cardVariants({ tint }), className),
    children,
  };
  return useRender({ defaultTagName: "a", render, props: mergeProps<"a">(ownProps, props) });
}
