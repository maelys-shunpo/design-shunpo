import { cva } from "class-variance-authority";
import { Fragment } from "react";

import { cn } from "../lib/cn.ts";

const statementVariants = cva(
  "flex flex-col gap-2 text-center font-display text-5xl text-foreground md:gap-3",
);

interface StatementLinesProps {
  /* The statement as paragraphs of lines, set as written; the last paragraph lands in semibold. */
  paragraphs: ReadonlyArray<readonly string[]>;
  /* A heading when the statement answers a heading above it; its paragraphs are then spans. */
  as?: "div" | "h2" | "h3";
  className?: string | undefined;
}

/* A short statement in display type, centred. From the small breakpoint each line sits in its own mask
   (`data-statement-line`) so a scene can raise it; on phones the lines flow as one balanced paragraph
   (`data-statement-paragraph`). */
export function StatementLines({
  paragraphs,
  as: Element = "div",
  className,
}: StatementLinesProps) {
  const Paragraph = Element === "div" ? "p" : "span";
  return (
    <Element data-slot="statement-lines" className={cn(statementVariants(), className)}>
      {paragraphs.map((lines, place) => (
        <Fragment key={lines.join(" ")}>
          {place > 0 ? " " : null}
          <Paragraph
            data-statement-paragraph=""
            className="block text-balance last:font-semibold sm:flex sm:flex-col"
          >
            {lines.map((line, index) => (
              <Fragment key={line}>
                {index > 0 ? " " : null}
                <span className="sm:block sm:overflow-clip sm:py-1">
                  <span data-statement-line="" className="sm:block">
                    {line}
                  </span>
                </span>
              </Fragment>
            ))}
          </Paragraph>
        </Fragment>
      ))}
    </Element>
  );
}
