import type { SimpleIcon } from "simple-icons";

interface ToolTileProps {
  icon: SimpleIcon;
  /* The name shown, when it differs from the logo's title. */
  name?: string | undefined;
}

/* A tool the agents plug into: its logo in its own colour, and its name. */
export function ToolTile({ icon, name }: ToolTileProps) {
  return (
    <div
      data-slot="tool-tile"
      className="agents-sheet flex h-16 w-full items-center justify-center gap-3 px-4 agents-sheet-lift sm:justify-start"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-6 shrink-0" fill={`#${icon.hex}`}>
        <path d={icon.path} />
      </svg>
      <span className="hidden truncate text-sm font-medium text-agents-ink sm:inline">
        {name ?? icon.title}
      </span>
    </div>
  );
}
