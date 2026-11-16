import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { CoupeHalves } from "../src/agents/coupe-halves.tsx";
import { poseCoupeDom } from "../src/scene/coupe-dom-pose.ts";

/* The halves are controlled: they split whatever they are handed and pose it from `pose`. The story owns a
   `sceneProgress` and poses them, so the control scrubs the gesture from the reading dwell (joined) through the fall
   (parted) to fully open. The demo content stands in for the frozen FAQ the scene feeds in. */
interface PreviewProps {
  sceneProgress: number;
}

function DemoFaq() {
  return (
    <div style={{ padding: "28px", color: "var(--color-agents-ink)", fontSize: "15px" }}>
      <h3 style={{ fontSize: "22px", marginBottom: "16px" }}>Questions fréquentes</h3>
      <p style={{ marginBottom: "12px" }}>
        Combien de temps pour un premier agent en production ? Deux à quatre semaines selon le
        périmètre.
      </p>
      <p style={{ marginBottom: "12px" }}>
        Faut-il remplacer nos outils ? Non, on branche les agents sur votre stack existante.
      </p>
      <p>Qui garde la main ? Vous : chaque action passe par une validation que vous réglez.</p>
    </div>
  );
}

function CoupeHalvesPreview({ sceneProgress }: PreviewProps) {
  return (
    <div
      className="relative overflow-clip bg-agents-paper"
      style={{ width: "640px", height: "360px" }}
    >
      <CoupeHalves pose={poseCoupeDom(sceneProgress)}>
        <DemoFaq />
      </CoupeHalves>
    </div>
  );
}

function upperHalf(canvasElement: HTMLElement): HTMLElement | null {
  return canvasElement.querySelector<HTMLElement>("[data-coupe-half=upper]");
}

function lowerHalf(canvasElement: HTMLElement): HTMLElement | null {
  return canvasElement.querySelector<HTMLElement>("[data-coupe-half=lower]");
}

const meta = {
  title: "Agents/CoupeHalves",
  component: CoupeHalvesPreview,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The two clipped FAQ halves of the DOM coupe. The content is split along the blade's cut into an upper and a lower copy, each posed from `poseCoupeDom`. At rest the clips rejoin the content into one block; as the gesture runs the halves slide, part, tilt and fall away, each with a washi back. The lower copy is `aria-hidden`, so the FAQ is read once.",
      },
    },
  },
  argTypes: {
    sceneProgress: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
  },
  args: { sceneProgress: 0.1 },
} satisfies Meta<typeof CoupeHalvesPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/* The reading dwell, before the gesture: both halves sit at identity and the clips rejoin the FAQ into one block. One
   copy of the content stays in the accessibility tree; the lower copy is hidden from it. */
export const Closed: Story = {
  args: { sceneProgress: 0.1 },
  play: async ({ canvasElement }) => {
    const upper = upperHalf(canvasElement);
    const lower = lowerHalf(canvasElement);
    await expect(upper).not.toBeNull();
    await expect(lower).not.toBeNull();
    await expect(upper?.style.transform).toMatch(/translate3d\(0%, 0%, 0px\)/u);
    await expect(lower?.style.transform).toMatch(/translate3d\(0%, 0%, 0px\)/u);

    await expect(upper?.getAttribute("aria-hidden")).toBeNull();
    await expect(lower?.getAttribute("aria-hidden")).toBe("true");
    const headings = within(canvasElement).getAllByRole("heading", { name: /Questions/u });
    await expect(headings).toHaveLength(1);
  },
};

/* Mid-fall: the page has given, the halves are parting and tilting — their transforms are non-identity. */
export const MidFall: Story = {
  args: { sceneProgress: 0.72 },
  play: async ({ canvasElement }) => {
    const upper = upperHalf(canvasElement);
    await expect(upper?.style.transform).not.toMatch(/translate3d\(0%, 0%, 0px\)/u);
    await expect(upper?.style.transform).toMatch(/rotateX/u);
  },
};

/* Fully open: both halves have fallen clear of the cut, well away from identity, uncovering the ground beneath. */
export const Open: Story = {
  args: { sceneProgress: 0.9 },
  play: async ({ canvasElement }) => {
    const upper = upperHalf(canvasElement);
    const lower = lowerHalf(canvasElement);
    await expect(upper?.style.transform).not.toMatch(/translate3d\(0%, 0%, 0px\)/u);
    await expect(lower?.style.transform).not.toMatch(/translate3d\(0%, 0%, 0px\)/u);
    await expect(lower?.getAttribute("aria-hidden")).toBe("true");
  },
};
