import type { ReactNode } from "react";

interface MethodStepProps {
  numeral: string;
  title: string;
  children: ReactNode;
}

/* A step of the method: a large display numeral over a crease line, its title and its text. */
export function MethodStep({ numeral, title, children }: MethodStepProps) {
  return (
    <li data-slot="origami-method-step" className="flex flex-col gap-6 border-t border-rule py-8">
      <span aria-hidden className="font-display text-7xl leading-none text-secondary">
        {numeral}
      </span>
      <h3 className="font-display text-3xl">{title}</h3>
      <p className="text-md text-muted-foreground">{children}</p>
    </li>
  );
}
