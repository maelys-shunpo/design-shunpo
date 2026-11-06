"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "../lib/cn.ts";

interface NavLinkProps extends useRender.ComponentProps<"a"> {
  /* A reference number drawn before the label, like a callout on a drawing. */
  index: string;
  className?: string;
}

/* An anchor of the masthead: its callout number lights in Tenku and a hairline draws under it on hover. */
export function NavLink({ render, index, className, children, ...props }: NavLinkProps) {
  const ownProps = {
    "data-slot": "nav-link",
    className: cn(
      "group relative inline-flex min-h-6 items-baseline gap-2 py-1 text-sm whitespace-nowrap text-muted-foreground transition-colors duration-200 hover:text-foreground",
      className,
    ),
    children: (
      <>
        <span className="font-mono text-xs transition-colors duration-200 group-hover:text-secondary">
          {index}
        </span>
        <span>{children}</span>
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-current transition-transform duration-200 ease-shift group-hover:scale-x-100"
        />
      </>
    ),
  };
  return useRender({ defaultTagName: "a", render, props: mergeProps<"a">(ownProps, props) });
}
