interface FaqItemProps {
  question: string;
  answer: string;
}

/* A question a manager asks before starting, answered plainly. Native disclosure: works without script.
   The toggle is a cut mark (`agents-cut-line`), the page's coupe at icon scale: hovering the row opens its
   cut and steps the question forward, opening it retires the cross to a minus, the answer unfolds. */
export function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <details
      data-slot="faq-item"
      className="group/faq agents-faq border-b border-border transition-colors duration-200 has-[>summary:hover]:border-foreground/30"
    >
      <summary className="group/row flex min-h-12 cursor-pointer list-none items-center justify-between gap-6 py-5 text-xl text-foreground [&::-webkit-details-marker]:hidden">
        <span className="transition-transform duration-200 ease-shift group-hover/row:translate-x-1">
          {question}
        </span>
        <span
          aria-hidden
          data-faq-cut
          className="agents-cut relative isolate size-6 shrink-0 self-center agents-cut-sm agents-cut-line before:bg-foreground/30 group-hover/row:before:bg-foreground/60"
        >
          <span className="absolute inset-x-1 top-1/2 h-px bg-current" />
          <span className="absolute inset-y-1 left-1/2 w-px bg-current transition-opacity duration-200 ease-shift group-open/faq:opacity-0" />
        </span>
      </summary>
      <p className="max-w-prose py-3 text-md text-muted-foreground">{answer}</p>
    </details>
  );
}
