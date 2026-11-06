"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn.ts";

const chipVariants = cva(
  "inline-flex shrink-0 items-center gap-1 rounded-full border whitespace-nowrap transition-colors duration-200",
  {
    variants: {
      size: {
        sm: "min-h-6 px-2 text-xs",
        md: "min-h-8 px-3 text-sm",
      },
      tone: {
        /* A suggestion the visitor can pick. */
        choice:
          "cursor-pointer border-border bg-surface text-muted-foreground hover:border-foreground/30 hover:text-foreground aria-pressed:border-foreground aria-pressed:text-foreground",
        /* A reference read inside an interface: a cited source, a tag. */
        quiet: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { size: "md", tone: "choice" },
  },
);

interface ChipProps extends useRender.ComponentProps<"button">, VariantProps<typeof chipVariants> {
  className?: string;
}

/* A pill: a suggestion to pick, or a source and a tag inside an interface. Renders a button by default. */
export function Chip({ render, size, tone, className, ...props }: ChipProps) {
  const ownProps = {
    "data-slot": "chip",
    className: cn(chipVariants({ size, tone }), className),
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(ownProps, props),
  });
}
