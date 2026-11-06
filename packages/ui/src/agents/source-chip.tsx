import { type LiveStep, liveAttributes } from "./live.ts";

interface SourceChipProps extends LiveStep {
  index: number;
  label: string;
}

/* A document an agent's answer cites. */
export function SourceChip({ index, label, live, liveKind }: SourceChipProps) {
  return (
    <span
      data-slot="source-chip"
      {...liveAttributes({ live, liveKind })}
      className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
    >
      <span className="font-mono">{index}</span>
      {label}
    </span>
  );
}
