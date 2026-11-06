import { cva, type VariantProps } from "class-variance-authority";
import type { DetailsHTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";

const faqVariants = cva("group border-t border-border", {
  variants: {
    size: {
      md: "",
      lg: "",
    },
  },
  defaultVariants: { size: "lg" },
});

interface FaqItemProps
  extends
    Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title">,
    VariantProps<typeof faqVariants> {
  index: string;
  question: string;
  answer: string;
}

/* A question and its answer in a native disclosure: keyboard, find-in-page and reduced motion come free.
   The cross turns into a minus, like a screw given a quarter turn. */
export function FaqItem({ index, question, answer, size, className, ...props }: FaqItemProps) {
  return (
    <details data-slot="faq-item" className={cn(faqVariants({ size }), className)} {...props}>
      <summary className="flex cursor-pointer list-none items-baseline gap-4 py-6 [&::-webkit-details-marker]:hidden">
        <span className="w-8 shrink-0 font-mono text-xs text-muted-foreground">{index}</span>
        <span className="flex-1 font-display text-xl font-heading">{question}</span>
        <span
          aria-hidden
          className="relative size-4 shrink-0 self-center transition-transform duration-200 ease-shift group-open:rotate-90"
        >
          <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
          <span className="absolute inset-y-0 left-1/2 w-px bg-current transition-opacity duration-200 group-open:opacity-0" />
        </span>
      </summary>
      <div className="flex flex-col gap-8 px-12">
        <p className="max-w-prose text-md text-muted-foreground">{answer}</p>
        <span aria-hidden />
      </div>
    </details>
  );
}
