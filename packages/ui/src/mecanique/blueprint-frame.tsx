import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";

const frameVariants = cva("relative border border-border", {
  variants: {
    padding: {
      md: "p-6",
      lg: "p-8 md:p-10",
    },
    tone: {
      plain: "",
      raised: "bg-surface",
    },
  },
  defaultVariants: { padding: "md", tone: "plain" },
});

/* Registration crosses at the four corners, the marks a drawing is aligned by. */
const CORNERS = [
  "-top-px -left-px border-t border-l",
  "-top-px -right-px border-t border-r",
  "-bottom-px -left-px border-b border-l",
  "-right-px -bottom-px border-r border-b",
] as const;

interface BlueprintFrameProps
  extends HTMLAttributes<HTMLElement>, VariantProps<typeof frameVariants> {
  as?: "div" | "article" | "li" | "section";
}

/* A part on the drawing board: a hairline box with its corners drawn heavier, like registration marks. */
export function BlueprintFrame({
  as: Element = "div",
  padding,
  tone,
  className,
  children,
  ...props
}: BlueprintFrameProps) {
  return (
    <Element
      data-slot="blueprint-frame"
      className={cn(frameVariants({ padding, tone }), className)}
      {...props}
    >
      {CORNERS.map((corner) => (
        <span
          key={corner}
          aria-hidden
          className={cn("pointer-events-none absolute size-3 border-foreground", corner)}
        />
      ))}
      {children}
    </Element>
  );
}
