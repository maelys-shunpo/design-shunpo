interface ScopeListProps {
  label: string;
  items: readonly string[];
}

/* What an expertise covers, as a run of mono labels separated by small crease marks. */
export function ScopeList({ label, items }: ScopeListProps) {
  return (
    <ul
      aria-label={label}
      data-slot="origami-scope-list"
      className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs tracking-wider text-foreground uppercase"
    >
      {items.map((item, index) => (
        <li key={item} className="flex items-center gap-4">
          {item}
          {index < items.length - 1 ? (
            <span aria-hidden className="text-secondary">
              /
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
