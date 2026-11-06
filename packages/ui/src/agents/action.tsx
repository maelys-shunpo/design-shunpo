"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn.ts";

const actionVariants = cva(
  "group/action inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors duration-200 select-none",
  {
    variants: {
      variant: {
        solid: "bg-primary text-primary-foreground hover:bg-primary/85",
        outline: "border border-foreground/25 bg-surface text-foreground hover:border-foreground",
        quiet:
          "text-foreground underline decoration-foreground/25 underline-offset-4 hover:decoration-foreground",
      },
      size: {
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-5 text-md",
      },
    },
    compoundVariants: [{ variant: "quiet", className: "h-auto px-0" }],
    defaultVariants: { variant: "solid", size: "md" },
  },
);

interface AgentsActionProps
  extends useRender.ComponentProps<"a">, VariantProps<typeof actionVariants> {
  className?: string | undefined;
}

/* A link styled as the page's action: solid ink for the one that matters, outline or quiet for the others. */
export function AgentsAction({ render, variant, size, className, ...props }: AgentsActionProps) {
  const ownProps = {
    "data-slot": "agents-action",
    className: cn(actionVariants({ variant, size }), className),
  };
  return useRender({ defaultTagName: "a", render, props: mergeProps<"a">(ownProps, props) });
}
