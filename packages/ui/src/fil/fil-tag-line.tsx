import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";

/* A line of hang tags: one string runs along the top of the row, and each FilReference hangs from it by its own
   short cord. Five in a row on wide screens, three on tablets, one per line on phones. */
export function FilTagLine({ className, children, ...props }: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      data-slot="fil-tag-line"
      className={cn("grid gap-y-12 md:grid-cols-3 xl:grid-cols-5", className)}
      {...props}
    >
      {children}
    </ul>
  );
}
