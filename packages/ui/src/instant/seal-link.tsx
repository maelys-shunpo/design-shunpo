"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

/* The primary action of the Instant direction: a seal of flat ink with square corners. On hover the label and the
   arrow leave upwards and their copies arrive from below in the same instant: the step, not a slide. */
const sealVariants = cva(
  "group/seal inline-flex shrink-0 cursor-pointer items-center gap-4 font-medium whitespace-nowrap select-none",
  {
    variants: {
      tone: {
        seal: "bg-accent text-accent-foreground",
        ink: "bg-primary text-primary-foreground",
      },
      size: {
        sm: "h-10 gap-3 px-4 text-sm",
        md: "h-12 px-5 text-md",
        lg: "h-16 px-8 text-lg",
      },
    },
    defaultVariants: { tone: "seal", size: "md" },
  },
);

const rollVariants = cva(
  "block transition-transform duration-300 ease-shift motion-reduce:transition-none",
  {
    variants: {
      copy: {
        first: "group-hover/seal:-translate-y-full group-focus-visible/seal:-translate-y-full",
        second:
          "absolute inset-0 translate-y-full group-hover/seal:translate-y-0 group-focus-visible/seal:translate-y-0",
      },
    },
  },
);

interface SealLinkProps extends useRender.ComponentProps<"a">, VariantProps<typeof sealVariants> {
  label: string;
  className?: string;
}

function Roll({ children }: { children: ReactNode }) {
  return (
    <span className="relative block overflow-hidden">
      <span className={rollVariants({ copy: "first" })}>{children}</span>
      <span aria-hidden className={rollVariants({ copy: "second" })}>
        {children}
      </span>
    </span>
  );
}

export function SealLink({ render, label, tone, size, className, ...props }: SealLinkProps) {
  const ownProps = {
    "data-slot": "seal-link",
    className: cn(sealVariants({ tone, size }), className),
    children: (
      <>
        <Roll>{label}</Roll>
        <Roll>
          <ArrowUpRight aria-hidden className="size-5" strokeWidth={1.5} />
        </Roll>
      </>
    ),
  };
  return useRender({ defaultTagName: "a", render, props: mergeProps<"a">(ownProps, props) });
}
