interface FaqItemProps {
  question: string;
  answer: string;
}

/* A question a manager asks before starting, answered plainly. Native disclosure: works without script. */
export function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <details data-slot="faq-item" className="group/faq border-b border-border">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-6 py-5 text-xl text-foreground [&::-webkit-details-marker]:hidden">
        {question}
        <span aria-hidden className="relative size-4 shrink-0">
          <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
          <span className="absolute inset-y-0 left-1/2 w-px bg-current transition-transform duration-300 group-open/faq:scale-y-0" />
        </span>
      </summary>
      <p className="max-w-prose py-3 text-md text-muted-foreground">{answer}</p>
    </details>
  );
}
