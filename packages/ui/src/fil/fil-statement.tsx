import { cn } from "../lib/cn.ts";

interface FilStatementProps {
  notThis: string;
  butThis: string;
  className?: string;
}

/* What a client does not buy, struck through by the red thread, then what they buy. The thread is in the markup;
   FilReveal draws it once the line enters the window. */
export function FilStatement({ notThis, butThis, className }: FilStatementProps) {
  return (
    <li
      data-slot="fil-statement"
      className={cn("grid gap-4 border-t border-rule py-10 md:grid-cols-2 md:gap-12", className)}
    >
      <p className="flex flex-col gap-2">
        <span className="text-lg">Vous n’achetez pas</span>
        <s className="relative w-fit font-display text-3xl font-semibold no-underline">
          {notThis}
          <span
            aria-hidden
            data-fil-strike
            className="absolute inset-x-0 top-1/2 h-1 origin-left -rotate-2 rounded-full"
            style={FUSHIMI}
          />
        </s>
      </p>
      <p className="flex flex-col gap-2">
        <span className="text-lg">Vous achetez</span>
        <span className="font-display text-4xl font-semibold text-balance">{butThis}</span>
      </p>
    </li>
  );
}

const FUSHIMI = { backgroundColor: "var(--brand-fushimi)" } as const;
