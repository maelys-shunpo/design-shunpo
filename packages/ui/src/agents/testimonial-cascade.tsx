import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

interface TestimonialCascadeProps {
  /* Testimonial cards, in reading order. */
  children: ReactNode[];
  label: string;
  className?: string | undefined;
}

/* Cards stepping down from one edge to the other from tablets up, a stack on phones. */
export function TestimonialCascade({ children, label, className }: TestimonialCascadeProps) {
  return (
    <ul
      data-slot="testimonial-cascade"
      aria-label={label}
      className={cn("flex flex-col gap-6", className)}
    >
      {children.map((child, index) => (
        <li
          // eslint-disable-next-line react/no-array-index-key -- the cards keep their order; their place is their key.
          key={index}
          className="md:w-5/6 md:even:self-end"
        >
          {child}
        </li>
      ))}
    </ul>
  );
}
