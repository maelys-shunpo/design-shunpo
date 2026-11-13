import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";
import { type LiveStep, liveAttributes } from "./live.ts";

/* Cut 10 px on the speaker's side: top right for the customer on the right, top left for the agent and the team. */
const bubbleVariants = cva(
  "agents-sheet flex max-w-full flex-col gap-2 px-4 py-3 text-sm agents-sheet-xs",
  {
    variants: {
      from: {
        customer: "self-end text-agents-paper agents-sheet-night",
        agent: "self-start text-agents-ink agents-sheet-left",
        human: "self-start text-agents-ink agents-sheet-info agents-sheet-left",
      },
    },
    defaultVariants: { from: "agent" },
  },
);

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
