import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { CoverSheet } from "../src/agents/cover-sheet.tsx";
import { Headline } from "../src/agents/headline.tsx";
import { Card } from "../src/components/card.tsx";
import { Container } from "../src/layout/container.tsx";
import { Section } from "../src/layout/section.tsx";
import { Text } from "../src/typography/text.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/Cover sheet",
  component: CoverSheet,
  decorators: [inAgents],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The rest of the page as one opaque sheet of its paper, rising over a held `HeroFilm` with a soft shadow cast upwards.",
      },
    },
  },
  args: {
    children: (
      <Container className="py-24">
        <Headline level={2} size="title">
          Votre entreprise grandit et vos outils ne suivent plus ?
        </Headline>
      </Container>
    ),
  },
} satisfies Meta<typeof CoverSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OverTheNight: Story = {
  render: (args) => (
    <div className="bg-fuji">
      <div className="h-24" />
      <CoverSheet {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const sheet = canvas.getByRole("heading", { level: 2 }).closest("[data-slot=cover-sheet]");
    await expect(sheet).not.toBeNull();
    await expect(getComputedStyle(sheet ?? document.body).position).toBe("relative");
  },
};

/* The folds of a crumpled washi on the Kome sheet and on a Shiro section inside it; the card on it stays smooth. */
export const Washi: Story = {
  args: {
    paper: "washi",
    children: (
      <>
        <Container className="py-24">
          <Headline level={2} size="title">
            Notre méthode : chaque projet commence par une Immersion
          </Headline>
        </Container>
        <Section tone="muted" spacing="regular" aria-label="Section Shiro">
          <Container>
            <Card padding="lg">
              <Text>Une carte posée sur le papier reste lisse.</Text>
            </Card>
          </Container>
        </Section>
      </>
    ),
  },
  play: async ({ canvas }) => {
    const sheet = canvas.getByRole("heading", { level: 2 }).closest("[data-slot=cover-sheet]");
    const shiro = canvas.getByRole("region", { name: "Section Shiro" });
    const card = canvas
      .getByText("Une carte posée sur le papier reste lisse.")
      .closest("[data-slot=card]");
    await expect(getComputedStyle(sheet ?? document.body).backgroundImage).toMatch(/agents-washi/u);
    await expect(getComputedStyle(shiro).backgroundImage).toMatch(/agents-washi/u);
    await expect(getComputedStyle(card ?? document.body).backgroundImage).toBe("none");
  },
};
