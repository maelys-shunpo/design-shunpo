interface CreaseLegendProps {
  label: string;
  valley: string;
  mountain: string;
}

/* The key of an origami diagram: a valley fold drawn in dashes, a mountain fold in dash and dot. */
export function CreaseLegend({ label, valley, mountain }: CreaseLegendProps) {
  return (
    <ul
      aria-label={label}
      data-slot="origami-crease-legend"
      className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs tracking-wider text-foreground uppercase"
    >
      <li className="flex items-center gap-3">
        <svg aria-hidden viewBox="0 0 48 4" className="block h-1 w-12">
          <line
            x1="0"
            y1="2"
            x2="48"
            y2="2"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            className="stroke-current"
          />
        </svg>
        {valley}
      </li>
      <li className="flex items-center gap-3">
        <svg aria-hidden viewBox="0 0 48 4" className="block h-1 w-12">
          <line
            x1="0"
            y1="2"
            x2="48"
            y2="2"
            strokeWidth="1.5"
            strokeDasharray="9 3 1.5 3"
            className="stroke-current"
          />
        </svg>
        {mountain}
      </li>
    </ul>
  );
}
