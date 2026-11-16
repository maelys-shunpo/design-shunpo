import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Container } from "../src/layout/container.tsx";
import { Direction } from "../src/layout/direction.tsx";
import { Section } from "../src/layout/section.tsx";
import { Stack } from "../src/layout/stack.tsx";
import { Heading } from "../src/typography/heading.tsx";
import { Text } from "../src/typography/text.tsx";

function DirectionContent() {
  return (
    <Section>
      <Container>
        <Stack gap="sm">
          <Heading level={2} size="hero">
            SHUNPO vous libère du temps.
          </Heading>
          <Text tone="muted">Couleurs, polices et angles suivent la direction de la page.</Text>
        </Stack>
      </Container>
    </Section>
  );
}

const meta = {
  title: "Layout/Direction",
  component: Direction,
  parameters: { layout: "fullscreen" },
  args: { name: "instant", children: <DirectionContent /> },
} satisfies Meta<typeof Direction>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Instant: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 2 })).toBeVisible();
  },
};
export const Mecanique: Story = { args: { name: "mecanique" } };
export const Fil: Story = { args: { name: "fil" } };
