import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

const tileVariants = cva("flex w-full min-w-0 flex-col justify-center gap-1 px-4 py-3 md:px-5", {
  variants: {
    /* card: a white card with a soft shadow. paper: a sheet a shade lighter than the page, a Shiro hairline and its
       top right corner cut on the bias, like the actions; no shadow. */
    material: {
      card: "rounded-surface border border-agents-line bg-surface shadow-agents-card",
      paper: "agents-paper-cut relative bg-surface/60",
    },
    /* wall: as tall as five eighths of its width, so four tiles in a drifting column always outrun its window. */
    size: {
      md: "min-h-20",
      lg: "min-h-24",
      wall: "aspect-8/5",
    },
  },
  defaultVariants: { material: "card", size: "md" },
});

interface ReferenceTileProps extends VariantProps<typeof tileVariants> {
  /* The client, read as the tile's text. */
  name: string;
  /* What we built for them, in a few words. */
  detail?: string | undefined;
  /* The client's logo (an svg or a next/image) at its own size, centred in place of the typeset name. Decorative: the
     name is read. */
  logo?: ReactNode;
  className?: string | undefined;
}

/* A client we worked for: their logo, or their name set like a wordmark, and what we built. */
export function ReferenceTile({
  name,
  detail,
  logo,
  material,
  size,
  className,
}: ReferenceTileProps) {
  return (
    <div data-slot="reference-tile" className={cn(tileVariants({ material, size }), className)}>
      {logo === undefined ? (
        <span className="font-display text-lg text-balance text-agents-ink sm:text-xl">{name}</span>
      ) : (
        <>
          <span
            aria-hidden
            className="flex items-center justify-center [&_img]:h-auto [&_img]:max-w-full [&_svg]:h-auto [&_svg]:max-w-full"
          >
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
