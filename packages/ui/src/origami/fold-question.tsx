import type { ReactNode } from "react";

interface FoldQuestionProps {
  question: string;
  children: ReactNode;
}

/* A question that unfolds: native details, a crease mark that turns as it opens. */
export function FoldQuestion({ question, children }: FoldQuestionProps) {
  return (
    <details data-slot="origami-fold-question" className="group/question border-t border-rule">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-2xl [&::-webkit-details-marker]:hidden">
        {question}
        <span
          aria-hidden
          className="font-mono text-xl text-secondary transition-transform duration-300 ease-emphasized group-open/question:rotate-45"
        >
          +
        </span>
      </summary>
      <p className="max-w-prose py-6 text-md text-muted-foreground">{children}</p>
    </details>
  );
}
