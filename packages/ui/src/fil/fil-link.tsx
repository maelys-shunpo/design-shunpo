import type { AnchorHTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";

interface FilLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

/* A text link on a fine rule; under the pointer the red thread runs over the rule from the left. */
export function FilLink({ className, children, ...props }: FilLinkProps) {
  return (
    <a
      data-slot="fil-link"
      className={cn(
        "group/fil-link relative inline-flex min-h-12 w-fit items-center self-start font-medium text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <span aria-hidden className="absolute inset-x-0 bottom-2 h-px bg-rule" />
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-2 h-0.5 origin-right scale-x-0 rounded-full bg-accent transition-transform duration-500 ease-emphasized group-hover/fil-link:origin-left group-hover/fil-link:scale-x-100"
      />
    </a>
  );
}
