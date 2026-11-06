"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn.ts";

const cardVariants = cva(
  "group/case flex aspect-3/4 w-full flex-col justify-between gap-6 overflow-clip rounded-2xl p-6 transition-transform duration-500 ease-emphasized hover:-translate-y-2",
  {
    variants: {
      tone: {
        ink: "bg-agents-ink text-agents-paper",
        paper: "border border-agents-line bg-surface text-agents-ink",
        signal: "bg-agents-signal text-agents-ink",
        cobalt: "bg-agents-info text-agents-paper",
        sand: "bg-agents-wait-tint text-agents-ink",
      },
    },
    defaultVariants: { tone: "paper" },
  },
);

interface CaseCardProps extends useRender.ComponentProps<"a">, VariantProps<typeof cardVariants> {
  client: string;
  project: string;
  stake: string;
  action: string;
  className?: string;
}

/* A published reference as a poster: the client in large serif, what was built, what was at stake. */
export function CaseCard({
  client,
  project,
  stake,
  action,
  tone,
  render,
  className,
  ...props
}: CaseCardProps) {
  const children = (
    <>
      <span className="font-mono text-xs tracking-wide uppercase">{project}</span>
      <span className="font-serif text-5xl leading-none italic">{client}</span>
      <span className="flex flex-col gap-3">
        <span className="text-sm">{stake}</span>
        <span className="inline-flex items-center gap-2 text-sm font-medium underline decoration-current/30 underline-offset-4 group-hover/case:decoration-current">
          {action}
        </span>
      </span>
    </>
  );
  const ownProps = {
    "data-slot": "case-card",
    className: cn(cardVariants({ tone }), className),
    children,
  };
  return useRender({ defaultTagName: "a", render, props: mergeProps<"a">(ownProps, props) });
}
