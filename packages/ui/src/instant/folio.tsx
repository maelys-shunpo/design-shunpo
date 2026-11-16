import { cn } from "../lib/cn.ts";

interface FolioProps {
  /* The number of the plate, set in the display face: "01". */
  index?: string;
  label: string;
  className?: string;
}

/* The running head of a plate: a number, a hairline, a name. Small, but it sets the register of the page. */
export function Folio({ index, label, className }: FolioProps) {
  return (
    <p
      data-slot="folio"
      className={cn(
        "flex items-center gap-3 text-sm font-medium tracking-wide text-muted-foreground",
        className,
      )}
    >
      {index === undefined ? null : <span className="font-display text-foreground">{index}</span>}
      <span aria-hidden className="h-px w-8 bg-rule" />
      <span>{label}</span>
    </p>
  );
}
