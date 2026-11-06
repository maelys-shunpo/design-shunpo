import { cn } from "../lib/cn.ts";

interface ExpertisePlateProps {
  index: string;
  title: string;
  /* The result the client buys, in one sentence, set large. */
  outcome: string;
  detail: string;
  scope: string[];
  example: string;
  className?: string;
}

/* One expertise as a printed plate: the number in the margin, the promise and the text in the body,
   and a worked example in a cartouche on the right. */
export function ExpertisePlate({
  index,
  title,
  outcome,
  detail,
  scope,
  example,
  className,
}: ExpertisePlateProps) {
  return (
    <article
      data-slot="expertise-plate"
      className={cn("grid grid-cols-1 gap-8 lg:grid-cols-12", className)}
    >
      <span
        aria-hidden
        className="font-display text-7xl font-semibold text-foreground lg:col-span-2"
      >
        {index}
      </span>
      <div className="grid content-start gap-6 lg:col-span-6">
        <h3 className="text-md font-medium text-muted-foreground">{title}</h3>
        <p className="font-display text-4xl font-heading text-foreground">{outcome}</p>
        <p className="max-w-prose text-md text-muted-foreground">{detail}</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-foreground">
          {scope.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span aria-hidden className="size-1 bg-foreground" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <aside className="grid content-start gap-3 self-start border border-rule p-6 lg:col-span-4">
        <p className="text-sm font-medium text-foreground">Exemple concret</p>
        <p className="text-md text-muted-foreground">{example}</p>
      </aside>
    </article>
  );
}
