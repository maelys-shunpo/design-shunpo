import { cn } from "../lib/cn.ts";
import type { LiveStep } from "./live.ts";
import { liveAttributes } from "./live.ts";

export interface DocumentLine {
  label: string;
  amount: string;
}

interface DocumentSheetProps {
  issuer: string;
  address: string;
  kind: string;
  reference: string;
  date: string;
  lines: DocumentLine[];
  total: string;
  /* The step at which the agent's highlight boxes land on the fields it reads. */
  scanStep?: LiveStep["live"] | undefined;
}

function Highlight({ step }: { step: number | undefined }) {
  return (
    <span
      aria-hidden
      {...liveAttributes({ live: step })}
      className="pointer-events-none absolute -inset-1 border border-agents-signal bg-agents-signal/10"
    />
  );
}

/* A supplier's document as the agent sees it: a printed page whose key fields get boxed as they are read. */
export function DocumentSheet({
  issuer,
  address,
  kind,
  reference,
  date,
  lines,
  total,
  scanStep,
}: DocumentSheetProps) {
  return (
    <div
      data-slot="document-sheet"
      className="agents-sheet flex flex-col gap-4 p-5 text-agents-ink agents-sheet-lift agents-sheet-bare"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="relative flex flex-col gap-0.5">
          <span className="text-sm font-medium">{issuer}</span>
          <span className="text-xs text-muted-foreground">{address}</span>
          <Highlight step={scanStep} />
        </div>
        <div className="relative flex flex-col items-end gap-0.5">
          <span className="font-mono text-xs tracking-wide uppercase">{kind}</span>
          <span className="font-mono text-xs text-muted-foreground">{reference}</span>
          <span className="font-mono text-xs text-muted-foreground">{date}</span>
          <Highlight step={scanStep} />
        </div>
      </div>
      <dl className="flex flex-col">
        {lines.map((line) => (
          <div
            key={line.label}
            className="flex justify-between gap-4 border-b border-agents-line py-2 text-xs"
          >
            <dt className="text-muted-foreground">{line.label}</dt>
            <dd className="font-mono">{line.amount}</dd>
          </div>
        ))}
      </dl>
      <div className={cn("relative flex items-baseline justify-between gap-4")}>
        <span className="text-xs font-medium">Total TTC</span>
        <span className="font-mono text-sm font-medium">{total}</span>
        <Highlight step={scanStep} />
      </div>
    </div>
  );
}
