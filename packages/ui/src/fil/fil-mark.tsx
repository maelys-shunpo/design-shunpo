import type { ReactNode } from "react";

interface FilMarkProps {
  children: ReactNode;
}

/* A word underlined by hand with the red thread, drawn by FilMotion as the headline enters the window. */
export function FilMark({ children }: FilMarkProps) {
  return (
    <span data-slot="fil-mark" className="relative inline-block">
      {children}
      <svg
        aria-hidden
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
        className="absolute inset-x-0 -bottom-2 h-4 w-full overflow-visible"
      >
        <path
          data-fil-underline
          d="M2 8 C 22 2, 48 11, 70 5 S 94 6, 98 3"
          fill="none"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          className="stroke-4"
          style={FUSHIMI}
        />
      </svg>
    </span>
  );
}

const FUSHIMI = { stroke: "var(--brand-fushimi)" } as const;
