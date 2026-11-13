import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn.ts";
import { Avatar } from "./avatar.tsx";

/* A leaf of fibrous washi on a Shiro hairline, its top right corner cut on the bias like the actions, no rounded
   corner: the words are printed on paper, not floated on a screen. */
const cardVariants = cva(
  "agents-sheet flex flex-col gap-5 agents-card-paper p-6 text-agents-ink agents-sheet-lift md:p-8",
);

type AvatarTone = "ink" | "cobalt" | "warm" | "mint";

interface TestimonialProps extends VariantProps<typeof cardVariants> {
  /* The words as the client wrote them. */
  quote: string;
  author: string;
  /* Their role and company: « CEO, Ops Clean ». */
  position: string;
  /* Shown in place of a portrait. */
  initials: string;
  tone?: AvatarTone | undefined;
  /* Where the words were published, under them. */
  source?: string | undefined;
  className?: string | undefined;
}

/* A client's words, signed: their initials, name and role above, the quote below. No network badge. */
export function Testimonial({
  quote,
  author,
  position,
  initials,
  tone = "ink",
  source,
  className,
}: TestimonialProps) {
  return (
    <figure data-slot="testimonial" className={cn(cardVariants(), className)}>
      <figcaption className="flex items-center gap-4">
        <Avatar initials={initials} tone={tone} size="lg" />
        <span className="flex min-w-0 flex-col">
          <span className="text-md font-medium">{author}</span>
          <span className="text-sm text-muted-foreground">{position}</span>
        </span>
      </figcaption>
      <blockquote className="text-md text-agents-ink">
        <p>{quote}</p>
      </blockquote>
      {source === undefined ? null : <p className="text-sm text-muted-foreground">{source}</p>}
    </figure>
  );
}
