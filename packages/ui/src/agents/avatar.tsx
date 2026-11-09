import { cva, type VariantProps } from "class-variance-authority";

import { Shuriken } from "../brand/shuriken.tsx";
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
        /* The agent itself: the SHUNPO shuriken, never a face. */
        agent: "",
      },
      size: {
        sm: "size-6",
        md: "size-8",
        /* Beside a quote's author. */
        lg: "size-10 text-sm",
      },
    },
    defaultVariants: { tone: "ink", size: "md" },
  },
);

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  /* Initials of a person; the agent shows the shuriken instead. */
  initials: string;
  className?: string | undefined;
}

/* Who wrote a message or owns a record in a mockup. Decorative: the name always sits beside it. */
export function Avatar({ initials, tone, size, className }: AvatarProps) {
  if (tone === "agent") {
    return (
      <Shuriken
        tone="signal"
        size="md"
        className={cn(avatarVariants({ tone: "agent", size }), className)}
      />
    );
  }
  return (
    <span aria-hidden data-slot="avatar" className={cn(avatarVariants({ tone, size }), className)}>
      {initials}
    </span>
  );
}
