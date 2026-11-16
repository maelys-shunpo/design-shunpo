"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "../lib/cn.ts";

interface NavAnchorProps extends useRender.ComponentProps<"a"> {
  className?: string | undefined;
}

/* A section link of the bar: grey, ink on hover, its word taken between square brackets « [ » « ] » that close on it
   from outside on hover, on focus and on the current item. */
export function NavAnchor({ render, className, ...props }: NavAnchorProps) {
  const ownProps = {
    "data-slot": "nav-anchor",
    className: cn(
      "agents-bracket inline-flex min-h-6 items-center text-muted-foreground transition-colors duration-200 hover:text-foreground",
      className,
    ),
  };
  return useRender({ defaultTagName: "a", render, props: mergeProps<"a">(ownProps, props) });
}
