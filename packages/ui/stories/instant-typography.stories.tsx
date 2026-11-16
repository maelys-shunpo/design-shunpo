import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Folio } from "../src/instant/folio.tsx";
import { SealMark } from "../src/instant/seal-mark.tsx";
import { ValueMark } from "../src/instant/value-mark.tsx";
import { VerticalText } from "../src/instant/vertical-text.tsx";
import { Inline } from "../src/layout/inline.tsx";
import { Stack } from "../src/layout/stack.tsx";
import { inInstant } from "./support/instant-direction.tsx";

const meta = {
  title: "Instant/Folio",
  component: Folio,
  decorators: [inInstant],
  parameters: {
    docs: {
      description: {
        component:
          "The small marks of the printed page: the folio that opens a plate, kanji set top to bottom (VerticalText), a value as its kanji (ValueMark) and the red seal (SealMark).",
      },
    },
  },
  args: { index: "01", label: "Le constat" },
} satisfies Meta<typeof Folio>;

export default meta;

type Story = StoryObj<typeof meta>;

export const RunningHead: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Le constat")).toBeVisible();
  },
};

export const WithoutIndex: Story = { render: (args) => <Folio label={args.label} /> };

export const Marks: Story = {
  render: (args) => (
    <Stack gap="xl">
      <Folio {...args} />
      <Inline gap="2xl" align="start">
        <VerticalText label="Shunpo, le pas instantané">瞬歩</VerticalText>
        <VerticalText size="lg" tone="muted" label="Kan, observer">
          観
        </VerticalText>
        <VerticalText size="sm" tone="accent" label="Shun, l’instant">
          瞬
        </VerticalText>
        <ul>
          <ValueMark kanji="透" name="Transparence" />
        </ul>
        <SealMark size="sm" />
        <SealMark />
        <SealMark size="lg" />
      </Inline>
    </Stack>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Shunpo, le pas instantané")).toBeInTheDocument();
    await expect(canvas.getByText("Transparence")).toBeVisible();
  },
};
