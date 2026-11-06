import { cva } from "class-variance-authority";
import type { ReactNode } from "react";

import type { DirectionName } from "../layout/direction.tsx";

const TICKS = Array.from({ length: 60 }, (_, index) => index * 6);
const THREADS = [-48, -30, -12, 6, 24, 42];

const visualVariants = cva("block size-full overflow-visible", {
  variants: {
    direction: {
      instant: "",
      mecanique: "",
      fil: "",
      agents: "",
      origami: "",
    },
  },
});

/* The ink sign of « Instant »: 瞬 in mincho and its red seal, which jumps a step on hover. */
function InstantVisual() {
  return (
    <>
      <text
        x="100"
        y="150"
        textAnchor="middle"
        fontSize="150"
        className="fill-current font-mincho transition-transform duration-300 ease-shift group-hover:-translate-x-4"
      >
        瞬
      </text>
      <g className="transition-transform duration-300 ease-shift group-hover:translate-x-4 group-hover:-translate-y-4">
        <rect x="150" y="150" width="34" height="34" className="fill-fushimi" />
        <text x="167" y="175" textAnchor="middle" fontSize="22" className="fill-kome font-mincho">
          歩
        </text>
      </g>
    </>
  );
}

/* The dial of « Mécanique »: a minute track that turns a quarter on hover, a Tenku hand, a Fushimi jewel. */
function MecaniqueVisual() {
  return (
    <>
      <circle cx="100" cy="100" r="92" className="fill-none stroke-frost/30" />
      <g className="origin-center transition-transform duration-700 ease-emphasized group-hover:rotate-90">
        {TICKS.map((angle) => (
          <line
            key={angle}
            x1="100"
            y1={angle % 30 === 0 ? 14 : 18}
            x2="100"
            y2="24"
            transform={`rotate(${angle} 100 100)`}
            className="stroke-frost"
            strokeWidth={angle % 30 === 0 ? 1.5 : 0.75}
          />
        ))}
      </g>
      <circle cx="100" cy="100" r="58" className="fill-none stroke-frost/20" />
      <line
        x1="100"
        y1="100"
        x2="100"
        y2="34"
        strokeWidth="2"
        className="origin-center stroke-tenku transition-transform duration-700 ease-emphasized group-hover:rotate-45"
      />
      <circle cx="100" cy="100" r="5" className="fill-fushimi" />
    </>
  );
}

/* The threads of « Le fil »: loose on the left, gathered into one cord on the right, closer still on hover. */
function FilVisual() {
  return (
    <g className="origin-center transition-transform duration-700 ease-emphasized group-hover:scale-y-75">
      {THREADS.map((offset, index) => (
        <path
          key={offset}
          d={`M 0 ${100 + offset * 1.6} C 70 ${100 - offset * 1.2}, 110 ${100 + offset * 0.4}, 200 ${100 + offset * 0.08}`}
          strokeWidth={index === 3 ? 5 : 3}
          strokeLinecap="round"
          className={index === 3 ? "fill-none stroke-fushimi" : "fill-none stroke-kome/80"}
        />
      ))}
    </g>
  );
}

/* The live interface of « Agents »: a request, the agent's reply, a tool call; the reply slides up on hover. */
function AgentsVisual() {
  return (
    <>
      <rect
        x="10"
        y="40"
        width="180"
        height="120"
        rx="12"
        className="fill-agents-paper stroke-agents-ink/10"
      />
      <rect x="24" y="56" width="96" height="18" rx="9" className="fill-agents-ink/10" />
      <g className="transition-transform duration-500 ease-emphasized group-hover:-translate-y-2">
        <rect x="80" y="84" width="96" height="18" rx="9" className="fill-agents-ink" />
        <rect
          x="24"
          y="112"
          width="120"
          height="30"
          rx="8"
          className="fill-none stroke-agents-ink/20"
        />
        <rect x="32" y="122" width="10" height="10" className="fill-agents-signal" />
        <rect x="50" y="124" width="70" height="6" rx="3" className="fill-agents-ink/30" />
      </g>
    </>
  );
}

/* A folded crane of « Origami »: facets of ivory and one citron wing, which lifts on hover. */
function OrigamiVisual() {
  return (
    <>
      <polygon points="20,130 100,110 70,150" className="fill-origami-ivory/70" />
      <polygon points="100,110 180,60 140,130" className="fill-origami-ivory" />
      <polygon points="70,150 100,110 140,130" className="fill-origami-ivory/50" />
      <g className="origin-center transition-transform duration-700 ease-emphasized group-hover:-rotate-12">
        <polygon points="100,110 80,40 120,95" className="fill-origami-citron" />
      </g>
      <polygon points="20,130 8,100 40,125" className="fill-origami-ivory/80" />
    </>
  );
}

const visuals = {
  instant: InstantVisual,
  mecanique: MecaniqueVisual,
  fil: FilVisual,
  agents: AgentsVisual,
  origami: OrigamiVisual,
} satisfies Record<DirectionName, () => ReactNode>;

interface ProposalVisualProps {
  direction: DirectionName;
}

/* The emblem of a direction on its proposal card. Decorative: the card names the direction. */
export function ProposalVisual({ direction }: ProposalVisualProps) {
  const Visual = visuals[direction];
  return (
    <svg
      aria-hidden
      data-slot="proposal-visual"
      viewBox="0 0 200 200"
      className={visualVariants({ direction })}
    >
      <Visual />
    </svg>
  );
}
