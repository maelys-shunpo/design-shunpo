"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
import { ArrowRight } from "lucide-react";

import type { DirectionName } from "../layout/direction.tsx";
import { cn } from "../lib/cn.ts";
import { ProposalVisual } from "./proposal-visual.tsx";

const cardVariants = cva(
  "group flex min-h-full flex-col justify-between gap-12 p-8 transition-colors duration-300 lg:min-h-svh lg:p-10",
  {
    variants: {
      direction: {
        instant: "bg-kome text-fuji",
        mecanique: "bg-fuji-deep text-shiro",
        fil: "bg-tenku text-kome",
        agents: "bg-agents-paper text-agents-ink",
        origami: "bg-origami-ivory text-agents-ink",
      },
    },
  },
);

const titleVariants = cva("", {
  variants: {
    direction: {
      instant: "font-mincho text-5xl font-medium",
      mecanique: "font-archivo text-4xl font-semibold font-stretch-expanded",
      fil: "font-bricolage text-5xl font-semibold",
      agents: "font-sans text-5xl font-regular tracking-normal",
      origami: "font-bodoni text-5xl font-regular",
    },
  },
});

interface ProposalCardProps extends useRender.ComponentProps<"a"> {
  direction: DirectionName;
  index: string;
  name: string;
  tagline: string;
  technique: string;
  action: string;
  className?: string;
}

/* One art direction offered on the proposals index: its own colours, face and emblem, linking to its page. */
export function ProposalCard({
  direction,
  index,
  name,
  tagline,
  technique,
  action,
  render,
  className,
  ...props
}: ProposalCardProps) {
  const children = (
    <>
      <span className="flex items-baseline justify-between gap-4 text-sm">
        <span className="font-mono">{index}</span>
        <span>{technique}</span>
      </span>
      <span className="mx-auto block w-3/5">
        <ProposalVisual direction={direction} />
      </span>
      <span className="flex flex-col gap-4">
        <span className={titleVariants({ direction })}>{name}</span>
        <span className="max-w-prose text-lg">{tagline}</span>
        <span className="inline-flex items-center gap-2 font-medium">
          {action}
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-300 ease-shift group-hover:translate-x-2"
          />
        </span>
      </span>
    </>
  );
  const ownProps = {
    "data-slot": "proposal-card",
    "data-direction-preview": direction,
    className: cn(cardVariants({ direction }), className),
    children,
  };
  return useRender({ defaultTagName: "a", render, props: mergeProps<"a">(ownProps, props) });
}
