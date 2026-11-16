import { type ReactElement, type ReactNode } from "react";

import { Marquee } from "./marquee.tsx";

/* First up, middle down, last up: neighbours drift opposite ways, and no two laps are equal so the columns never fall
   in step. */
const DEFAULT_LAPS: readonly [number, number, number] = [46, 54, 50];

interface TestimonialDriftProps {
  /* The testimonial cards, in order. Any number: the three columns take every third one. */
  children: ReactNode[];
  /* Names the group for assistive tech, e.g. « Avis de clients ». */
  label: string;
  /* Seconds for one lap of each column (first up, middle down, last up). */
  laps?: readonly [number, number, number];
}

/* Three columns of testimonials drifting, the middle against its neighbours and each at its own lap, from `lg`, and a
   single row drifting left below it. The group takes a tab stop: focus on it, or the pointer over any column, holds
   every column (WCAG 2.2.2, the same answer as the references wall, with no pause button). Under reduced motion each
   Marquee unfolds, so the cards stand whole and each is read once. */
export function TestimonialDrift({
  children,
  label,
  laps = DEFAULT_LAPS,
}: TestimonialDriftProps): ReactElement {
  const columnOne = children.filter((_, index) => index % 3 === 0);
  const columnTwo = children.filter((_, index) => index % 3 === 1);
  const columnThree = children.filter((_, index) => index % 3 === 2);
  return (
    /* The drift has no focusable cards, so the labelled group itself takes focus: that is how a keyboard visitor holds
       the drift. No HTML tag carries « a group you can rest focus on », so role and tabindex stay. */
    /* eslint-disable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/prefer-tag-over-role -- see the note above. */
    <div
      data-slot="testimonial-drift"
      role="group"
      aria-label={label}
      tabIndex={0}
      className="focus-visible:ring-3 focus-visible:ring-ring/45 focus-visible:outline-none"
    >
      <div className="hidden gap-6 lg:grid lg:grid-cols-3">
        <Marquee direction="up" lap={laps[0]} extent="window" still="unfold">
          {columnOne}
        </Marquee>
        <Marquee direction="down" lap={laps[1]} extent="window" still="unfold">
          {columnTwo}
        </Marquee>
        <Marquee direction="up" lap={laps[2]} extent="window" still="unfold">
          {columnThree}
        </Marquee>
      </div>
      <Marquee direction="left" lap={60} still="unfold" className="lg:hidden">
        {children.map((child, index) => (
          // eslint-disable-next-line react/no-array-index-key -- a card is its place in the row.
          <div key={index} className="agents-drift-card">
            {child}
          </div>
        ))}
      </Marquee>
    </div>
    /* eslint-enable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/prefer-tag-over-role */
  );
}
