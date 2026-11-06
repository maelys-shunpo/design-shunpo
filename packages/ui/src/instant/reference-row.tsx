"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ArrowUpRight } from "lucide-react";

import { cn } from "../lib/cn.ts";

interface ReferenceRowProps extends useRender.ComponentProps<"a"> {
  name: string;
  project: string;
  stake: string;
  className?: string;
}

/* A published reference, set as a line of a register. On hover the line turns to ink in one step (the fill rises
   from its foot), the name moves one notch and the arrow points the way. */
export function ReferenceRow({
  render,
  name,
  project,
  stake,
  className,
  ...props
}: ReferenceRowProps) {
  const ownProps = {
    "data-slot": "reference-row",
    className: cn(
      "group/reference relative grid grid-cols-1 items-center gap-2 overflow-hidden border-t border-rule px-4 py-8 text-foreground transition-colors duration-300 ease-shift hover:text-primary-foreground focus-visible:text-primary-foreground motion-reduce:transition-none md:grid-cols-12 md:gap-8",
      className,
    ),
    children: (
      <>
        <span
          aria-hidden
          className="absolute inset-0 origin-bottom scale-y-0 bg-primary transition-transform duration-300 ease-shift group-hover/reference:scale-y-100 group-focus-visible/reference:scale-y-100 motion-reduce:transition-none"
        />
        <span className="relative font-display text-5xl font-heading transition-transform duration-300 ease-shift group-hover/reference:translate-x-4 motion-reduce:transition-none md:col-span-6">
          {name}
        </span>
        <span className="relative grid gap-1 md:col-span-5">
          <span className="text-lg font-medium">{project}</span>
          <span className="text-sm opacity-80">{stake}</span>
        </span>
        <ArrowUpRight
          aria-hidden
          strokeWidth={1.25}
          className="relative hidden size-8 justify-self-end transition-transform duration-300 ease-shift group-hover/reference:rotate-45 motion-reduce:transition-none md:block"
        />
      </>
    ),
  };
  return useRender({ defaultTagName: "a", render, props: mergeProps<"a">(ownProps, props) });
}
