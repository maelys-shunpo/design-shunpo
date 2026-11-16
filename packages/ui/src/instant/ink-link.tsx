"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn.ts";

/* A link written on a faint rule. On hover a full stroke of ink is drawn from the left, in one quick gesture,
   and withdrawn to the right when the pointer leaves. */
const inkVariants = cva(
  "group/ink relative inline-flex items-center py-2 font-medium whitespace-nowrap",
  {
    variants: {
      size: {
        sm: "text-sm",
        md: "text-md",
      },
    },
    defaultVariants: { size: "md" },
  },
);

interface InkLinkProps extends useRender.ComponentProps<"a">, VariantProps<typeof inkVariants> {
  className?: string;
}

export function InkLink({ render, size, className, children, ...props }: InkLinkProps) {
  const ownProps = {
    "data-slot": "ink-link",
    className: cn(inkVariants({ size }), className),
    children: (
      <>
        {children}
        <span aria-hidden className="absolute inset-x-0 bottom-1 h-px bg-rule opacity-50" />
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-1 h-px origin-right scale-x-0 bg-foreground transition-transform duration-500 ease-shift group-hover/ink:origin-left group-hover/ink:scale-x-100 group-focus-visible/ink:origin-left group-focus-visible/ink:scale-x-100 motion-reduce:transition-none"
        />
      </>
    ),
  };
  return useRender({ defaultTagName: "a", render, props: mergeProps<"a">(ownProps, props) });
}
