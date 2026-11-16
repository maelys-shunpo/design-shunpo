import { Plus } from "lucide-react";

import { cn } from "../lib/cn.ts";

interface QuestionProps {
  question: string;
  children: string;
  className?: string;
}

/* A question and its answer, folded: the native disclosure, so it opens with the keyboard and without script.
   It opens at once, in keeping with the direction; the cross turns to mark it open. */
export function Question({ question, children, className }: QuestionProps) {
  return (
    <details data-slot="question" className={cn("group/question border-t border-rule", className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
        <span className="font-display text-2xl font-heading text-foreground">{question}</span>
        <Plus
          aria-hidden
          strokeWidth={1.25}
          className="size-6 shrink-0 transition-transform duration-300 ease-shift group-open/question:rotate-45 motion-reduce:transition-none"
        />
      </summary>
      <p className="max-w-prose py-4 text-md text-muted-foreground">{children}</p>
    </details>
  );
}
