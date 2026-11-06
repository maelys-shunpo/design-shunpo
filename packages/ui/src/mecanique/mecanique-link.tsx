"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";

import { Icon } from "../components/icon.tsx";
import { cn } from "../lib/cn.ts";

const linkVariants = cva(
  "group relative inline-flex shrink-0 items-center justify-between gap-6 font-mono font-medium tracking-wide uppercase transition-colors duration-200 ease-shift",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-foreground hover:bg-accent/90",
        outline: "border border-rule text-foreground hover:bg-muted",
        quiet: "text-foreground",
      },
      size: {
        md: "h-12 px-5 text-xs",
        lg: "h-16 px-8 text-sm",
      },
    },
    compoundVariants: [{ variant: "quiet", className: "justify-start px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

/* Brackets that close on the button as the pointer arrives: a part seated in its setting. */
const BRACKETS = [
  "top-0 left-0 border-t border-l -translate-x-1 -translate-y-1",
  "top-0 right-0 border-t border-r translate-x-1 -translate-y-1",
  "bottom-0 left-0 border-b border-l -translate-x-1 translate-y-1",
  "right-0 bottom-0 border-r border-b translate-x-1 translate-y-1",
] as const;

interface MecaniqueLinkProps
  extends useRender.ComponentProps<"a">, VariantProps<typeof linkVariants> {
  className?: string;
}

function Brackets() {
  return BRACKETS.map((corner) => (
    <span
      key={corner}
      aria-hidden
      className={cn(
        "pointer-events-none absolute size-2 border-foreground opacity-0 transition duration-200 ease-shift group-hover:translate-0 group-hover:opacity-100 group-focus-visible:translate-0 group-focus-visible:opacity-100",
        corner,
      )}
    />
  ));
}

/* The direction's call to action: a plate with a mono label and an arrow that leaves toward its target. */
export function MecaniqueLink({
  render,
  variant,
  size,
  className,
  children,
  ...props
}: MecaniqueLinkProps) {
  const ownProps = {
    "data-slot": "mecanique-link",
    className: cn(linkVariants({ variant, size }), className),
    children: (
      <>
        {variant === "quiet" ? null : <Brackets />}
        <span>{children}</span>
        <Icon
          icon={ArrowUpRight}
          size="sm"
          className="transition-transform duration-200 ease-shift group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </>
    ),
  };
  return useRender({ defaultTagName: "a", render, props: mergeProps<"a">(ownProps, props) });
}
