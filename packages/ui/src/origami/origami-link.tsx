"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn.ts";

/* A sharp tab of paper: on hover its top corner folds down and the label slides a step. */
const linkVariants = cva(
  "group/link pointer-events-auto relative inline-flex min-h-12 items-center gap-3 px-6 py-3 font-mono text-xs font-medium tracking-wider whitespace-nowrap uppercase transition duration-300 ease-emphasized",
  {
    variants: {
      variant: {
        solid: "bg-accent text-accent-foreground",
        outline: "border border-rule text-foreground hover:border-foreground",
        quiet: "px-0 text-muted-foreground hover:text-foreground",
      },
    },
    defaultVariants: { variant: "solid" },
  },
);

interface OrigamiLinkProps
  extends useRender.ComponentProps<"a">, VariantProps<typeof linkVariants> {
  className?: string;
}

export function OrigamiLink({ render, variant, className, children, ...props }: OrigamiLinkProps) {
  const ownProps = {
    "data-slot": "origami-link",
    className: cn(linkVariants({ variant }), className),
    children: (
      <>
        <span className="transition-transform duration-300 ease-emphasized group-hover/link:translate-x-1">
          {children}
        </span>
        <span
          aria-hidden
          className="transition-transform duration-300 ease-emphasized group-hover/link:translate-x-1"
        >
          →
        </span>
      </>
    ),
  };
  return useRender({ defaultTagName: "a", render, props: mergeProps<"a">(ownProps, props) });
}
