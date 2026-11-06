"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";

import { cn } from "../lib/cn.ts";

const actionVariants = cva(
  "group/action inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap transition duration-200 select-none active:scale-98 aria-disabled:pointer-events-none aria-disabled:opacity-40",
  {
    variants: {
      variant: {
        /* The one action that matters on a screen: ink, or Kome on a dark island. */
        solid: "bg-primary text-primary-foreground hover:bg-primary/90",
        /* A second choice beside it. */
        outline:
          "border border-foreground/20 bg-transparent text-foreground hover:border-foreground/60 hover:bg-foreground/5",
        /* A link set as text, underlined. */
        quiet:
          "text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground",
      },
      size: {
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-md",
      },
    },
    compoundVariants: [{ variant: "quiet", className: "h-auto px-0" }],
    defaultVariants: { variant: "solid", size: "md" },
  },
);

interface AgentsActionProps
  extends useRender.ComponentProps<"a">, VariantProps<typeof actionVariants> {
  /* A trailing arrow that steps forward on hover: for actions that take the visitor somewhere. */
  arrow?: boolean;
  className?: string | undefined;
}

/* The page's action, a link by default (render a button for a form): solid for the one that matters, outline or quiet
   for the others. */
export function AgentsAction({
  render,
  variant,
  size,
  arrow = false,
  className,
  children,
  ...props
}: AgentsActionProps) {
  const ownProps = {
    "data-slot": "agents-action",
    className: cn(actionVariants({ variant, size }), className),
    children: arrow ? (
      <>
        {children}
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-200 group-hover/action:translate-x-0.5"
        />
      </>
    ) : (
      children
    ),
  };
  return useRender({ defaultTagName: "a", render, props: mergeProps<"a">(ownProps, props) });
}
