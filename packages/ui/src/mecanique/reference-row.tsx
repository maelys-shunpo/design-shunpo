"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ArrowUpRight } from "lucide-react";

import { Icon } from "../components/icon.tsx";
import { cn } from "../lib/cn.ts";

interface ReferenceRowProps extends useRender.ComponentProps<"a"> {
  name: string;
  project: string;
  stake: string;
  className?: string;
}

/* A published case on one ruled line: the name set wide, the project and its stake as annotations. A Tenku
   hairline runs along the line and the arrow leaves toward the case as the pointer arrives. */
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
      "group relative grid grid-cols-1 items-baseline gap-2 border-t border-border py-8 md:grid-cols-12 md:gap-6",
      className,
    ),
    children: (
      <>
        <span
          aria-hidden
          className="absolute inset-x-0 -top-px h-px origin-left scale-x-0 bg-secondary transition-transform duration-500 ease-shift group-hover:scale-x-100"
        />
        <span className="font-display text-3xl font-heading transition-transform duration-500 ease-shift group-hover:translate-x-2 md:col-span-5 md:text-4xl">
          {name}
        </span>
        <span className="text-md md:col-span-3">{project}</span>
        <span className="font-mono text-xs tracking-wide text-muted-foreground uppercase md:col-span-3">
          {stake}
        </span>
        <Icon
          icon={ArrowUpRight}
          className="hidden justify-self-end transition-transform duration-200 ease-shift group-hover:translate-x-1 group-hover:-translate-y-1 md:col-span-1 md:block"
        />
      </>
    ),
  };
  return useRender({ defaultTagName: "a", render, props: mergeProps<"a">(ownProps, props) });
}
