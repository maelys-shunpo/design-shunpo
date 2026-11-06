import type { ReactNode } from "react";

interface EmphasisProps {
  children: ReactNode;
}

/* The one folded word of a title: the display italic, in citron. */
export function Emphasis({ children }: EmphasisProps) {
  return (
    <em data-slot="origami-emphasis" className="text-accent italic">
      {children}
    </em>
  );
}
