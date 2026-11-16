"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "../lib/cn.ts";

interface ReferenceLineProps extends useRender.ComponentProps<"a"> {
  name: string;
  project: string;
  stake: string;
  className?: string;
}

/* A reference as a line of the register: the name in display type, what was built and what was at stake.
   On hover the line folds open a step: the name slides, the stake lights. */
export function ReferenceLine({
  name,
  project,
  stake,
  render,
  className,
  ...props
}: ReferenceLineProps) {
  const ownProps = {
    "data-slot": "origami-reference-line",
    className: cn(
      "group/reference grid gap-2 border-t border-rule py-6 md:grid-cols-2 md:items-baseline md:gap-8",
      className,
    ),
    children: (
      <>
        <span className="font-display text-4xl transition-transform duration-500 ease-emphasized group-hover/reference:translate-x-4">
          {name}
        </span>
        <span className="flex flex-col gap-1">
          <span className="text-md">{project}</span>
          <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase transition-colors duration-300 group-hover/reference:text-secondary">
            {stake}
          </span>
        </span>
      </>
    ),
  };
  return useRender({ defaultTagName: "a", render, props: mergeProps<"a">(ownProps, props) });
}
