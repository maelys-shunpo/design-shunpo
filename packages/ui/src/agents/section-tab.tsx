import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn.ts";

const tabVariants = cva("block h-1 w-10 shrink-0 rounded-full bg-foreground", {
  variants: {
    align: {
      start: "self-start",
      center: "self-center",
    },
  },
  defaultVariants: { align: "start" },
});

interface SectionTabProps extends VariantProps<typeof tabVariants> {
  className?: string | undefined;
}

/* A short ink bar that opens a section's heading, the way a tab marks the page it heads. Decorative. */
export function SectionTab({ align, className }: SectionTabProps) {
  return (
    <span aria-hidden data-slot="section-tab" className={cn(tabVariants({ align }), className)} />
  );
}
