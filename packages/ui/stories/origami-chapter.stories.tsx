import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { Chapter } from "../src/origami/chapter.tsx";
import { Emphasis } from "../src/origami/emphasis.tsx";
import { ScopeList } from "../src/origami/scope-list.tsx";
import { Heading } from "../src/typography/heading.tsx";
import { Text } from "../src/typography/text.tsx";
import { plainPoster } from "./support/plain-scene.tsx";

const meta = {
  title: "Origami/Chapter",
  component: Chapter,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <Direction name="origami">
        <Story />
      </Direction>
    ),
  ],
  args: {
    index: "01 · La grue",
    title: <Heading level={2}>Intelligence artificielle et automatisation</Heading>,
    children: (
      <>
        <Heading level={3} size="title-sm">
          <Emphasis>Les tâches répétitives se font seules.</Emphasis>
        </Heading>
        <Text tone="muted">
          Des process manuels deviennent des systèmes automatisés et fiables.
        </Text>
        <ScopeList
          label="Ce que couvre l’expertise"
          items={["Agents IA", "Relances", "Extraction de données"]}
        />
      </>
    ),
    still: plainPoster("Une grue en papier citron"),
  },
} satisfies Meta<typeof Chapter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Piece: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(canvas.getByRole("list", { name: "Ce que couvre l’expertise" })).toBeVisible();
  },
};

export const Hero: Story = { args: { place: "hero", still: undefined } };
