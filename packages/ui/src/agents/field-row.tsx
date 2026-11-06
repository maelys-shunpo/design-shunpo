import { cn } from "../lib/cn.ts";
import { type LiveStep, liveAttributes } from "./live.ts";

interface FieldRowProps extends LiveStep {
  label: string;
  value: string;
  /* How sure the agent is, as shown in the app: « 99 % ». */
  confidence?: string | undefined;
  /* A value the agent flags for a human. */
  flagged?: boolean;
}

/* A field the agent extracted from a document. */
export function FieldRow({
  label,
  value,
  confidence,
  flagged = false,
  live,
  liveKind,
}: FieldRowProps) {
  return (
    <div
      data-slot="field-row"
      {...liveAttributes({ live, liveKind })}
      className="grid grid-cols-2 items-baseline gap-3 border-b border-agents-line py-2 last:border-b-0"
    >
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="flex items-baseline justify-end gap-2 text-end">
        <span className={cn("truncate text-sm font-medium", flagged && "text-agents-wait")}>
          {value}
        </span>
        {confidence === undefined ? null : (
          <span className="shrink-0 font-mono text-xs text-muted-foreground">{confidence}</span>
        )}
      </dd>
    </div>
  );
}
