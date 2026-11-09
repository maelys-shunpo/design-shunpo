import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

const tileVariants = cva(
  "flex w-full min-w-0 flex-col justify-center gap-1 rounded-surface border border-agents-line bg-surface px-4 py-3 shadow-agents-card md:px-5",
  {
    variants: {
      size: {
        md: "min-h-20",
        lg: "min-h-24",
      },
    },
    defaultVariants: { size: "md" },
  },
);

interface ReferenceTileProps extends VariantProps<typeof tileVariants> {
  /* The client, read as the tile's text. */
  name: string;
  /* What we built for them, in a few words. */
  detail?: string | undefined;
  /* The client's logo (an svg or a next/image), drawn in place of the typeset name. Decorative: the name is read. */
  logo?: ReactNode;
  className?: string | undefined;
}

/* A client we worked for: their logo, or their name set like a wordmark, and what we built. */
export function ReferenceTile({ name, detail, logo, size, className }: ReferenceTileProps) {
  return (
    <div data-slot="reference-tile" className={cn(tileVariants({ size }), className)}>
      {logo === undefined ? (
        <span className="font-display text-lg text-balance text-agents-ink sm:text-xl">{name}</span>
      ) : (
        <>
          <span aria-hidden className="flex h-8 items-center [&_img]:h-full [&_svg]:h-full">
            {logo}
          </span>
          <span className="sr-only">{name}</span>
        </>
      )}
      {detail === undefined ? null : (
        <span className="hidden text-xs text-muted-foreground sm:block">{detail}</span>
      )}
    </div>
  );
}
