import type { SimpleIcon } from "simple-icons";

import { type LiveStep, liveAttributes } from "./live.ts";

interface ToolCallProps extends LiveStep {
  /* The tool the agent acts in, from simple-icons; omitted for an in-house system. */
  icon?: SimpleIcon | undefined;
  tool: string;
  action: string;
  /* The step at which its progress bar fills. */
  progressStep?: number | undefined;
  result?: string | undefined;
}

/* An action the agent takes in another tool: where, what, a progress bar, and what came back. */
export function ToolCall({
  icon,
  tool,
  action,
  progressStep,
  result,
  live,
  liveKind,
}: ToolCallProps) {
  return (
    <div
      data-slot="tool-call"
      {...liveAttributes({ live, liveKind })}
      className="flex flex-col gap-2 border-b border-agents-line bg-surface p-3"
    >
      <div className="flex items-center gap-2">
        <span aria-hidden className="grid size-6 shrink-0 place-items-center bg-muted">
          {icon === undefined ? (
            <span className="size-2 bg-agents-ink" />
          ) : (
            <svg viewBox="0 0 24 24" className="size-3 fill-current">
              <path d={icon.path} />
            </svg>
          )}
        </span>
        <span className="text-xs font-medium">{tool}</span>
        <span className="truncate text-xs text-muted-foreground">{action}</span>
      </div>
      <span className="block h-1 overflow-clip rounded-full bg-muted">
        <span
          {...liveAttributes({ live: progressStep, liveKind: "grow" })}
          className="block size-full rounded-full bg-agents-ink"
        />
      </span>
      {result === undefined ? null : (
        <span className="font-mono text-xs text-muted-foreground">{result}</span>
      )}
    </div>
  );
}
