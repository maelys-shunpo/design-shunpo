import type { ReactNode } from "react";

interface EmphasisProps {
  children: ReactNode;
}

/* The one accented word of a title: the same roman, in cobalt. No italic in a title. */
export function Emphasis({ children }: EmphasisProps) {
  return (
    <em data-slot="origami-emphasis" className="text-secondary not-italic">
      {children}
    </em>
  );
}
