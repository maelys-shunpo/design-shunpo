import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";

import { cn } from "../lib/cn.ts";

/* Each tag hangs a little askew, as tags do; under the pointer it swings straight and lifts. */
const tagVariants = cva(
  "group/fil-tag flex w-full origin-top flex-col gap-6 rounded-2xl bg-surface p-6 text-foreground transition-transform duration-500 ease-emphasized hover:translate-y-1 hover:rotate-0 md:p-8 xl:p-6",
  {
    variants: {
      tilt: {
        left: "-rotate-1",
        right: "rotate-1",
        none: "",
      },
    },
    defaultVariants: { tilt: "none" },
  },
);

interface FilReferenceProps extends VariantProps<typeof tagVariants> {
  name: string;
  project: string;
  stake: string;
  href: string;
  className?: string;
}

/* A client reference as a hang tag on FilTagLine's string: the cord, the eyelet, the name, the project. */
export function FilReference({ name, project, stake, href, tilt, className }: FilReferenceProps) {
  return (
    <li
      data-slot="fil-reference"
      className={cn(
        "relative flex flex-col items-center gap-2 border-t-2 border-rule px-2",
        className,
      )}
    >
      <span aria-hidden className="absolute top-0 h-12 w-0.5 bg-rule" />
      <span aria-hidden className="h-8" />
      <a href={href} className={tagVariants({ tilt })}>
        <span className="flex items-center justify-between gap-4">
          <span aria-hidden className="size-5" />
          <span aria-hidden className="size-4 rounded-full border-2 border-rule" />
          <ArrowUpRight
            aria-hidden
            className="size-5 transition-transform duration-300 ease-emphasized group-hover/fil-tag:translate-x-1 group-hover/fil-tag:-translate-y-1"
          />
        </span>
        <span className="font-display text-2xl font-heading text-balance md:text-3xl xl:text-2xl">
          {name}
        </span>
        <span className="flex flex-col gap-2">
          <span className="text-lg font-medium">{project}</span>
          <span className="text-sm text-muted-foreground">{stake}</span>
        </span>
      </a>
    </li>
  );
}
