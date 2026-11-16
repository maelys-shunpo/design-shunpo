import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";

/* The steps of a method strung on one rail: the rail runs through the knots from the tablet up, and its red
   share is drawn by FilReveal as the steps enter the window. */
export function FilSteps({ className, children, ...props }: HTMLAttributes<HTMLOListElement>) {
  return (
    <div data-slot="fil-steps" className={cn("relative", className)}>
      <span aria-hidden className="absolute inset-x-0 top-6 hidden h-0.5 bg-rule md:block" />
      <span
        aria-hidden
        data-fil-rail
        className="absolute inset-x-0 top-6 hidden h-0.5 origin-left rounded-full bg-accent md:block"
      />
      <ol className="relative grid gap-12 md:grid-cols-3 md:gap-10" {...props}>
        {children}
      </ol>
    </div>
  );
}
