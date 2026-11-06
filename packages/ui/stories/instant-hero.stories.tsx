import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { HeroCopy } from "../src/instant/hero-copy.tsx";
import { OrientationPicture } from "../src/instant/orientation-picture.tsx";
import { Reveal } from "../src/instant/reveal.tsx";
import { StateCaptions } from "../src/instant/state-captions.tsx";
import { Heading } from "../src/typography/heading.tsx";
import { inInstant } from "./support/instant-direction.tsx";

const PLATE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23dcd5c7'/%3E%3C/svg%3E";

const states = [
  { id: "semaine", title: "Votre semaine.", text: "Pleine." },
  { id: "temps", title: "Votre temps.", text: "Il reste ce qui compte." },
];

const meta = {
  title: "Instant/HeroCopy",
  component: HeroCopy,
  decorators: [inInstant],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The copy of the Instant hero, laid over the paper: a column left of the drawing in landscape, the lower half under it in portrait, the lead hidden in portrait. StateCaptions stacks one caption per drawing; Reveal plays entrances once the page is idle; OrientationPicture art-directs the poster by orientation.",
      },
    },
  },
  args: {
    intro: <Heading level={1}>SHUNPO vous libère du temps.</Heading>,
    lead: <p>Nous retirons de vos journées ce qui se répète.</p>,
    captions: <StateCaptions states={states} />,
  },
} satisfies Meta<typeof HeroCopy>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Column: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(canvas.getByText("Votre semaine.")).toBeVisible();
  },
};

export const WithoutLead: Story = {
  render: (args) => <HeroCopy intro={args.intro} captions={args.captions} />,
};

export const Revealed: Story = {
  render: () => (
    <Reveal>
      <Heading level={2}>Trois expertises, un seul interlocuteur.</Heading>
    </Reveal>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 2 })).toBeVisible();
  },
};

export const Poster: Story = {
  render: () => (
    <OrientationPicture landscape={PLATE} portrait={{ src: PLATE, alt: "Une planche vide" }} />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "Une planche vide" })).toBeInTheDocument();
  },
};
