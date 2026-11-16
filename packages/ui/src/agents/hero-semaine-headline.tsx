import { HeadlinePart } from "./headline-part.tsx";
import { Headline } from "./headline.tsx";

export interface WeekHeadline {
  context: string;
  lead: string;
  before: string;
  after: string;
}

/* The context in grey, then the promise in ink whose last word turns from `before` to `after` as the week empties.
   The two words share one cell, so nothing reflows; the heading is read once, with `after`. Phones and reduced
   motion show `after`. */
export function HeroSemaineHeadline({ headline }: { headline: WeekHeadline }) {
  return (
    <Headline level={1} size="title">
      <span className="sr-only">{`${headline.context} ${headline.lead} ${headline.after}`}</span>
      <span aria-hidden>
        <HeadlinePart tone="dim" block>
          {headline.context}
        </HeadlinePart>
        <HeadlinePart block>
          {headline.lead}{" "}
          {/* The wider word holds the room; the other is laid over it, out of the flow. */}
          <span className="relative inline-block">
            <span data-week-word="before" className="opacity-0 md:motion-safe:opacity-100">
              {headline.before}
            </span>
            <span
              data-week-word="after"
              className="absolute inset-s-0 top-0 whitespace-nowrap md:motion-safe:opacity-0"
            >
              {headline.after}
            </span>
          </span>
        </HeadlinePart>
      </span>
    </Headline>
  );
}
