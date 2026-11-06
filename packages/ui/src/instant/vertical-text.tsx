import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn.ts";

const verticalVariants = cva("font-display leading-none select-none writing-vertical", {
  variants: {
    size: {
      sm: "text-2xl",
      md: "text-5xl",
      lg: "text-8xl",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      accent: "text-accent",
    },
  },
  defaultVariants: { size: "md", tone: "default" },
});

/* Set upright in a vertical line, a fallback mincho draws its kanji wider than the 1em line box, past its right
   edge: room on both sides keeps the ink inside the box, so the page never scrolls sideways.
   The large rail only stands beside a heading from tablets up: on a phone it would push the heading off screen. */
const roomVariants = cva("", {
  variants: {
    size: {
      sm: "inline-flex px-2",
      md: "inline-flex px-2 md:px-6",
      lg: "hidden md:inline-flex md:px-6 lg:px-12",
    },
  },
  defaultVariants: { size: "md" },
});

interface VerticalTextProps extends VariantProps<typeof verticalVariants> {
  /* Kanji set top to bottom, read as a graphic: its meaning is given by label. */
  children: string;
  /* What the kanji say, for screen readers. */
  label: string;
  className?: string;
}

export function VerticalText({ children, label, size, tone, className }: VerticalTextProps) {
  return (
    <span data-slot="vertical-text" className={cn(roomVariants({ size }), className)}>
      <span aria-hidden className={verticalVariants({ size, tone })}>
        {children}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
