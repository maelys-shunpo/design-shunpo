import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import type { AnchorHTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";

/* A pill pulled by a thread (ink flips with the scheme: Kome on Fuji or Tenku grounds): on hover a thread runs under the label, the arrow leaves on the right and comes
   back from the left; pressed, the pill draws in. */
const buttonVariants = cva(
  "group/fil-button relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full font-display font-semibold whitespace-nowrap transition-transform duration-300 ease-emphasized active:scale-95",
  {
    variants: {
      tone: {
        ink: "bg-primary text-primary-foreground",
        red: "bg-accent text-accent-foreground",
        outline: "border-2 border-foreground text-foreground",
      },
      size: {
        md: "h-12 px-6 text-md",
        lg: "h-16 px-8 text-lg",
      },
    },
    defaultVariants: { tone: "ink", size: "md" },
  },
);

const threadVariants = cva(
  "absolute inset-x-6 bottom-3 h-0.5 origin-left scale-x-0 rounded-full transition-transform duration-500 ease-emphasized group-hover/fil-button:scale-x-100",
  {
    variants: {
      tone: {
        ink: "bg-accent",
        red: "bg-accent-foreground",
        outline: "bg-accent",
      },
    },
    defaultVariants: { tone: "ink" },
  },
);

interface FilButtonProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof buttonVariants> {
  href: string;
}

export function FilButton({ tone, size, className, children, ...props }: FilButtonProps) {
  return (
    <a data-slot="fil-button" className={cn(buttonVariants({ tone, size }), className)} {...props}>
      <span>{children}</span>
      <span aria-hidden className="relative grid size-5 place-items-center overflow-hidden">
        <ArrowRight className="col-start-1 row-start-1 size-5 transition-transform duration-500 ease-emphasized group-hover/fil-button:translate-x-full" />
        <ArrowRight className="col-start-1 row-start-1 size-5 -translate-x-full transition-transform duration-500 ease-emphasized group-hover/fil-button:translate-x-0" />
      </span>
      <span aria-hidden className={threadVariants({ tone })} />
    </a>
  );
}
