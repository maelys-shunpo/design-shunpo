import { Chip } from "./chip.tsx";
import { type LiveStep, liveAttributes } from "./live.ts";

interface SourceChipProps extends LiveStep {
  index: number;
  label: string;
}

/* A document an agent's answer cites. */
export function SourceChip({ index, label, live, liveKind }: SourceChipProps) {
  return (
    <Chip
      render={<span />}
      size="sm"
      tone="quiet"
      data-source-chip=""
      {...liveAttributes({ live, liveKind })}
    >
      <span className="font-mono">{index}</span>
      {label}
    </Chip>
  );
}
