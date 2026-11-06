"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import type { KeyboardEvent, PointerEvent, ReactNode } from "react";

import { cn } from "../lib/cn.ts";
import { centreOf, playPressHighlight } from "../lib/press-highlight.ts";

const actionVariants = cva(
  "group/action relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-control font-medium whitespace-nowrap transition duration-200 ease-press select-none focus-visible:ring-3 focus-visible:ring-ring/45 focus-visible:outline-none active:scale-98 aria-disabled:pointer-events-none aria-disabled:opacity-40",
  {
    variants: {
      variant: {
        /* The one action that matters on a screen: ink, or Kome on a dark island. */
        solid: "bg-primary text-primary-foreground hover:bg-primary-hover",
        /* A second choice beside it. */
        outline:
          "border border-foreground/20 bg-transparent text-foreground hover:border-foreground/50 hover:bg-foreground/5",
        /* A link set as text, underlined. */
        quiet:
          "overflow-visible text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground",
      },
      size: {
        /* Inside an interface. */
        sm: "h-8 px-3 text-sm",
        /* The bar, inline actions. */
        md: "h-10 px-4 text-sm",
        /* Heroes and calls. */
        lg: "h-12 px-6 text-md",
      },
    },
    compoundVariants: [{ variant: "quiet", className: "h-auto px-0" }],
    defaultVariants: { variant: "solid", size: "md" },
  },
);

/* idle: the label. busy: a spinner in its place, the width unchanged. done: a check, before the label returns. */
export type ActionState = "idle" | "busy" | "done";

interface AgentsActionProps
  extends useRender.ComponentProps<"a">, VariantProps<typeof actionVariants> {
  /* A trailing arrow that steps forward on hover: for actions that take the visitor somewhere. */
  arrow?: boolean;
  state?: ActionState;
  className?: string | undefined;
}

function Label({
  arrow,
  state,
  children,
}: {
  arrow: boolean;
  state: ActionState;
  children: ReactNode;
}) {
  const waiting = state !== "idle";
  return (
    <>
      <span
        aria-hidden
        data-press-highlight=""
        className="pointer-events-none absolute -z-10 rounded-full bg-current opacity-0"
      />
      <span className={cn("inline-flex items-center gap-2", waiting && "invisible")}>
        {children}
        {arrow ? (
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-200 ease-press group-hover/action:translate-x-0.5"
          />
        ) : null}
      </span>
      {waiting ? (
        <span aria-hidden className="absolute inset-0 grid place-items-center">
          {state === "busy" ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
        </span>
      ) : null}
    </>
  );
}

function highlightFromPointer(event: PointerEvent<HTMLElement>): void {
  playPressHighlight(event.currentTarget, { x: event.clientX, y: event.clientY });
}

function highlightFromKey(event: KeyboardEvent<HTMLElement>): void {
  if (event.key === "Enter" || event.key === " ") {
    playPressHighlight(event.currentTarget, centreOf(event.currentTarget));
  }
}

/* The page's action, a link by default (render a button for a form): solid for the one that matters, outline or
   quiet for the others. It dips when pressed while a highlight spreads from the point pressed, from the keyboard
   too; under reduced motion it only changes state. */
export function AgentsAction({
  render,
  variant,
  size,
  arrow = false,
  state = "idle",
  className,
  children,
  ...props
}: AgentsActionProps) {
  const ownProps = {
    "data-slot": "agents-action",
    "aria-busy": state === "busy" ? true : undefined,
    className: cn(actionVariants({ variant, size }), className),
    onPointerDown: variant === "quiet" ? undefined : highlightFromPointer,
    onKeyDown: variant === "quiet" ? undefined : highlightFromKey,
    children: (
      <Label arrow={arrow} state={state}>
        {children}
      </Label>
    ),
  };
  return useRender({ defaultTagName: "a", render, props: mergeProps<"a">(ownProps, props) });
}
