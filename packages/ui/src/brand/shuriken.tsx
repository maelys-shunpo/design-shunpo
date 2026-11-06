import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn.ts";
import { PEBBLE, SHURIKEN_BOX, STAR } from "./shuriken-paths.ts";

/* The badge: the shuriken in its pebble, in the charter's three pairs. The glyph: the star alone, in the text
   colour, small enough to mark a label or stand for the agent in an interface. */
const shurikenVariants = cva("block shrink-0", {
  variants: {
    tone: {
      signal: "",
      paper: "",
      night: "",
      glyph: "",
    },
    size: {
      xs: "size-3",
      sm: "size-4",
      md: "size-8",
      lg: "size-12",
      xl: "size-24",
    },
  },
  defaultVariants: { tone: "signal", size: "md" },
});

const pebbleVariants = cva("", {
  variants: {
    tone: { signal: "fill-fushimi", paper: "fill-shiro", night: "fill-fuji", glyph: "hidden" },
  },
  defaultVariants: { tone: "signal" },
});

const starVariants = cva("", {
  variants: {
    tone: {
      signal: "fill-shiro",
      paper: "fill-fushimi",
      night: "fill-shiro",
      glyph: "fill-current",
    },
  },
  defaultVariants: { tone: "signal" },
});

interface ShurikenProps extends VariantProps<typeof shurikenVariants> {
  /* Read in place of the drawing; omit it when the shuriken only decorates a named thing. */
  label?: string;
  className?: string | undefined;
}

/* The SHUNPO symbol. */
export function Shuriken({ tone, size, label, className }: ShurikenProps) {
  return (
    <svg
      data-slot="shuriken"
      viewBox={SHURIKEN_BOX}
      aria-hidden={label === undefined ? true : undefined}
      aria-label={label}
      role={label === undefined ? undefined : "img"}
      className={cn(shurikenVariants({ tone, size }), className)}
    >
      <path d={PEBBLE} className={pebbleVariants({ tone })} />
      <path d={STAR} fillRule="evenodd" className={starVariants({ tone })} />
    </svg>
  );
}
