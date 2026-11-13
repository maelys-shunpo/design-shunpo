import { cva } from "class-variance-authority";
import { Fragment } from "react";

import { cn } from "../lib/cn.ts";
import { InkWord } from "./ink-word.tsx";

/* The type of a section title (`Headline size="title"`). */
const statementVariants = cva(
  "flex flex-col gap-2 text-center font-display text-5xl font-heading text-foreground md:gap-3",
);

interface StatementLinesProps {
  /* The statement as paragraphs of lines, set as written, all in the same weight. */
  paragraphs: ReadonlyArray<readonly string[]>;
  /* A heading when the statement answers a heading above it; its paragraphs are then spans. */
  as?: "div" | "h2" | "h3";
  /* The word the statement is about, set between ink brackets (`InkWord`) where it first appears in the last
     paragraph; the scene around the statement paints its entrance. */
  keyword?: string | undefined;
  className?: string | undefined;
}

/* A line as written, its keyword (if it holds it) between ink brackets. */
function Line({ text, keyword }: { text: string; keyword: string | undefined }) {
  const at = keyword === undefined || keyword === "" ? -1 : text.indexOf(keyword);
  if (keyword === undefined || at < 0) {
    return text;
  }
  return (
    <>
      {text.slice(0, at)}
      <InkWord entrance="scene">{keyword}</InkWord>
      {text.slice(at + keyword.length)}
    </>
  );
}

/* A short statement in display type, centred. From the small breakpoint each line sits in its own mask
   (`data-statement-line`) so a scene can raise it; on phones the lines flow as one balanced paragraph
   (`data-statement-paragraph`). */
export function StatementLines({
  paragraphs,
  as: Element = "div",
  keyword,
  className,
}: StatementLinesProps) {
  const Paragraph = Element === "div" ? "p" : "span";
  return (
    <Element data-slot="statement-lines" className={cn(statementVariants(), className)}>
      {paragraphs.map((lines, place) => (
        <Fragment key={lines.join(" ")}>
          {place > 0 ? " " : null}
          <Paragraph data-statement-paragraph="" className="block text-balance sm:flex sm:flex-col">
            {lines.map((line, index) => (
              <Fragment key={line}>
                {index > 0 ? " " : null}
                <span className="sm:block sm:overflow-clip sm:py-1">
                  <span data-statement-line="" className="sm:block">
                    <Line
                      text={line}
                      keyword={place === paragraphs.length - 1 ? keyword : undefined}
                    />
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
