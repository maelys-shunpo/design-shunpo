import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";

const directionVariants = cva("min-h-svh bg-background text-foreground", {
  variants: {
    name: {
      instant: "",
      mecanique: "",
      fil: "",
    },
  },
});

export type DirectionName = NonNullable<VariantProps<typeof directionVariants>["name"]>;

interface DirectionProps extends HTMLAttributes<HTMLDivElement> {
  name: DirectionName;
}

/* Names the art direction of a page: theme.css recolours, retypes and re-corners the whole document from it
   (`:root:has([data-direction])`), so the canvas behind the page, the scrollbar and every island follow. */
export function Direction({ name, className, ...props }: DirectionProps) {
  return (
    <div
      data-slot="direction"
      data-direction={name}
      className={cn(directionVariants({ name }), className)}
      {...props}
    />
  );
}
