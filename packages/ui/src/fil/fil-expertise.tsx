import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn.ts";

const cardVariants = cva(
  "grid gap-10 rounded-2xl bg-background p-8 text-foreground md:sticky md:top-24 md:grid-cols-2 md:gap-16 md:p-16",
  {
    variants: {
      ground: {
        paper: "bg-surface scheme-light",
        tenku: "scheme-field",
        ink: "scheme-dark",
      },
    },
    defaultVariants: { ground: "paper" },
  },
);

interface FilExpertiseProps extends VariantProps<typeof cardVariants> {
  index: string;
  title: string;
  outcome: string;
  detail: string;
  scope: string[];
  example: string;
  className?: string;
}

/* One craft as a full card. From the tablet up the cards stick under the window's top, so each new craft is
   laid over the last like a band added to the braid. */
export function FilExpertise({
  ground,
  index,
  title,
  outcome,
  detail,
  scope,
  example,
  className,
}: FilExpertiseProps) {
  return (
    <article data-slot="fil-expertise" className={cn(cardVariants({ ground }), className)}>
      <div className="flex flex-col justify-between gap-10">
        <div className="flex flex-col gap-6">
          <h3 className="font-display text-4xl font-heading text-balance">{title}</h3>
          <p className="font-display text-2xl font-medium text-balance">{outcome}</p>
        </div>
        <span
          aria-hidden
          className="font-display text-8xl font-semibold text-muted-foreground font-stretch-condensed"
        >
          {index}
        </span>
      </div>
      <div className="flex flex-col gap-8">
        <p className="text-lg">{detail}</p>
        <ul aria-label="Interventions" className="flex flex-wrap gap-2">
          {scope.map((item) => (
            <li key={item} className="rounded-full border border-rule px-4 py-2 text-sm">
              {item}
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 rounded-xl bg-muted p-6">
          <span className="text-sm font-semibold">Exemple concret</span>
          <p className="text-md text-muted-foreground">{example}</p>
        </div>
      </div>
    </article>
  );
}
