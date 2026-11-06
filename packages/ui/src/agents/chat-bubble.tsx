import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";
import { type LiveStep, liveAttributes } from "./live.ts";

const bubbleVariants = cva("flex max-w-full flex-col gap-2 rounded-2xl px-4 py-3 text-sm", {
  variants: {
    from: {
      customer: "self-end bg-agents-ink text-agents-paper",
      agent: "self-start border border-agents-line bg-surface text-agents-ink",
      human: "self-start bg-agents-info-tint text-agents-ink",
    },
  },
  defaultVariants: { from: "agent" },
});

interface ChatBubbleProps extends VariantProps<typeof bubbleVariants>, LiveStep {
  author: string;
  time?: string | undefined;
  children: ReactNode;
  /* The documents the answer rests on: SourceChip elements. */
  sources?: ReactNode;
  /* The step at which the words type in, after the bubble appears. */
  typeStep?: number | undefined;
}

/* A message in a conversation between a customer, the agent and the team. */
export function ChatBubble({
  from,
  author,
  time,
  children,
  sources,
  typeStep,
  live,
  liveKind,
}: ChatBubbleProps) {
  return (
    <div
      data-slot="chat-bubble"
      {...liveAttributes({ live, liveKind })}
      className={cn(bubbleVariants({ from }))}
    >
      <span className="flex items-baseline gap-2 text-xs opacity-80">
        <span className="font-medium">{author}</span>
        {time === undefined ? null : <span className="font-mono">{time}</span>}
      </span>
      <span {...liveAttributes({ live: typeStep, liveKind: "type" })}>{children}</span>
      {sources === undefined ? null : <span className="flex flex-wrap gap-1">{sources}</span>}
    </div>
  );
}
