interface FaqItemProps {
  question: string;
  answer: string;
}

/* A question a manager asks before starting, answered plainly. Native disclosure: works without script.
   The row is the affordance, « le trait »: hovering it draws an ink rule across the row and steps the
   question forward; opening it holds the rule as a divider under the question while the answer rises bare
   beneath it, flush left, no frame. The toggle is a bare notation (`agents-faq`), the plus's vertical arm
   retracting to a minus — never a framed box. */
export function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <details data-slot="faq-item" className="group/faq agents-faq border-b border-border">
      <summary className="group/row flex min-h-12 cursor-pointer list-none items-center justify-between gap-6 py-5 text-xl font-medium text-foreground [&::-webkit-details-marker]:hidden">
        <span className="transition-transform duration-200 ease-shift group-hover/row:translate-x-1">
          {question}
        </span>
        <span
          aria-hidden
          data-faq-mark
          className="relative size-6 shrink-0 self-center text-foreground"
        >
          <span className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-current" />
          <span
            data-faq-bar
            className="absolute inset-y-1 left-1/2 w-px -translate-x-1/2 bg-current"
          />
        </span>
      </summary>
      <p data-faq-answer className="max-w-prose py-3 text-md text-muted-foreground">
        {answer}
      </p>
    </details>
  );
}
