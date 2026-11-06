import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn.ts";

const avatarVariants = cva(
  "inline-grid shrink-0 place-items-center rounded-full text-xs font-medium",
  {
    variants: {
      tone: {
        ink: "bg-agents-ink text-agents-paper",
        cobalt: "bg-agents-info-tint text-agents-info",
        warm: "bg-agents-wait-tint text-agents-wait",
        mint: "bg-agents-ok-tint text-agents-ok",
        /* The agent itself: the signal square, never a face. */
        agent: "rounded-md bg-agents-signal text-agents-ink",
      },
      size: {
        sm: "size-6",
        md: "size-8",
      },
    },
    defaultVariants: { tone: "ink", size: "md" },
  },
);

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  /* Initials of a person, or a glyph for the agent. */
  initials: string;
  className?: string | undefined;
}

/* Who wrote a message or owns a record in a mockup. Decorative: the name always sits beside it. */
export function Avatar({ initials, tone, size, className }: AvatarProps) {
  return (
    <span aria-hidden data-slot="avatar" className={cn(avatarVariants({ tone, size }), className)}>
      {initials}
    </span>
  );
}
