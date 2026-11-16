import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { GridArea } from "../src/layout/grid-area.tsx";
import { PageGrid } from "../src/layout/page-grid.tsx";
import { Heading } from "../src/typography/heading.tsx";
import { Text } from "../src/typography/text.tsx";

const meta = {
  title: "Layout/PageGrid",
  component: PageGrid,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PageGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

/* A plain number centres the span: the title on 10 of 12 columns, the text on 6. */
export const Centred: Story = {
  render: () => (
    <PageGrid rows="md">
      <GridArea columns={{ md: 8, lg: 10 }}>
        <Heading level={2} size="display" align="center">
          Des agents IA qui font le travail.
        </Heading>
      </GridArea>
      <GridArea columns={{ md: 6, lg: 6 }}>
        <Text align="center">Le texte reste sur six colonnes, centré.</Text>
      </GridArea>
    </PageGrid>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 2 })).toBeVisible();
  },
};

export const Symmetric: Story = {
  render: () => (
    <PageGrid rows="md">
      <GridArea columns={{ md: { start: 1, span: 4 }, lg: { start: 1, span: 6 } }}>
        <Text>Première moitié.</Text>
      </GridArea>
      <GridArea columns={{ md: { start: 5, span: 4 }, lg: { start: 7, span: 6 } }}>
        <Text>Seconde moitié.</Text>
      </GridArea>
    </PageGrid>
  ),
};

export const Editorial: Story = {
  render: () => (
    <PageGrid rows="lg">
      <GridArea columns={{ md: { start: 1, span: 2 }, lg: { start: 1, span: 3 } }}>
        <Text size="sm">Label</Text>
      </GridArea>
      <GridArea
        columns={{ md: { start: 3, span: 6 }, lg: { start: 4, span: 9 } }}
        overflow="visible"
      >
        <Heading level={2} size="title">
          Un titre qui démarre à la quatrième colonne.
        </Heading>
      </GridArea>
      <GridArea columns={{ md: "bleed", lg: "bleed" }}>
        <Text align="center">Une bande pleine largeur, d’un bord de page à l’autre.</Text>
      </GridArea>
    </PageGrid>
  ),
};
