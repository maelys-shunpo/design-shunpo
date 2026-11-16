import { type LiveStep, liveAttributes } from "./live.ts";

interface TypingDotsProps extends Pick<LiveStep, "live"> {
  label: string;
}

/* « The agent is writing »: shown only during its step of a live surface, hidden in the painted page. */
export function TypingDots({ label, live }: TypingDotsProps) {
  return (
    <span
      data-slot="typing-dots"
      aria-hidden
      {...liveAttributes({ live, liveKind: "transient" })}
      className="hidden items-center gap-2 self-start rounded-full bg-surface px-3 py-2 text-xs text-muted-foreground"
    >
      <span className="flex gap-1">
        <span className="size-1 rounded-full bg-agents-ink" />
        <span className="size-1 rounded-full bg-agents-ink/60" />
        <span className="size-1 rounded-full bg-agents-ink/30" />
      </span>
      {label}
    </span>
  );
}
