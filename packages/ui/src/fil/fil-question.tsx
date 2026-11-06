import { cn } from "../lib/cn.ts";

interface FilQuestionProps {
  question: string;
  answer: string;
  className?: string;
}

/* A question that unties: the knot of the summary turns into a cross as the answer opens. */
export function FilQuestion({ question, answer, className }: FilQuestionProps) {
  return (
    <details
      data-slot="fil-question"
      className={cn("group/fil-question border-b border-rule", className)}
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-xl font-semibold [&::-webkit-details-marker]:hidden">
        {question}
        <span
          aria-hidden
          className="relative grid size-10 shrink-0 place-items-center rounded-full border-2 border-foreground transition-transform duration-500 ease-emphasized group-open/fil-question:rotate-45 group-open/fil-question:border-accent"
        >
          <span className="h-0.5 w-4 rounded-full bg-current" />
          <span className="absolute inset-0 m-auto h-4 w-0.5 rounded-full bg-current" />
        </span>
      </summary>
      <p className="max-w-prose py-4 text-lg text-muted-foreground">{answer}</p>
    </details>
  );
}
