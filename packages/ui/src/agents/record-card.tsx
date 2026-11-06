import type { ReactNode } from "react";

import { Avatar } from "./avatar.tsx";
import { type LiveStep, liveAttributes } from "./live.ts";

interface RecordCardProps extends LiveStep {
  name: string;
  initials: string;
  subtitle: string;
  /* FieldRow elements: what the agent filled in. */
  children: ReactNode;
}

/* A CRM record the agent enriches: who, then the fields it completed. */
export function RecordCard({
  name,
  initials,
  subtitle,
  children,
  live,
  liveKind,
}: RecordCardProps) {
  return (
    <div
      data-slot="record-card"
      {...liveAttributes({ live, liveKind })}
      className="flex flex-col gap-3 rounded-lg border border-agents-line bg-surface p-4"
    >
      <div className="flex items-center gap-3">
        <Avatar initials={initials} tone="cobalt" />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{name}</span>
          <span className="truncate text-xs text-muted-foreground">{subtitle}</span>
        </span>
      </div>
      <dl className="flex flex-col">{children}</dl>
    </div>
  );
}
