import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  siBrevo,
  siGmail,
  siGooglecalendar,
  siGooglesheets,
  siHubspot,
  siNotion,
  siOdoo,
  siSage,
  siShopify,
  siStripe,
  siZendesk,
} from "simple-icons";
import { expect } from "storybook/test";

import { Headline } from "../src/agents/headline.tsx";
import type { ToolMark } from "../src/agents/tool-hub-layout.ts";
import { ToolHub } from "../src/agents/tool-hub.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const googleAgenda: ToolMark = { ...siGooglecalendar, title: "Google Agenda" };

const yours: ToolMark = {
  slug: "votre-logiciel",
  title: "Votre logiciel",
  hex: "1E2629",
  path: "M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z",
  yours: true,
};

const meta = {
  title: "Agents/Tool hub",
  component: ToolHub,
  decorators: [inAgents],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "ToolHub sets the copy over an octagon holding the SHUNPO seal, the tools cut from the sheet down two symmetric arcs, and a beam of 45°-chamfered wires running each tool into the ring. Every tool sends a continuous flow of ink to the centre; the octagon is drawn on in ink, then wiped off, in a slow sweep; the tools float a few pixels. The owner's own software waits as a dashed slot on a dashed wire until a connector is built. A control stops the flows; off screen and under reduced motion everything is still, the composition whole. The wide layout shows from lg, the phone layout below.",
      },
    },
  },
  args: {
    label: "Vos outils, reliés à votre agent",
    sealLabel: "Votre agent",
    desk: {
      left: [siGmail, siShopify, siStripe, siZendesk, googleAgenda, siBrevo],
      right: [siOdoo, siSage, siGooglesheets, siNotion, siHubspot, yours],
    },
    phone: {
      left: [siGmail, siShopify, siStripe, googleAgenda],
      right: [siOdoo, siSage, siGooglesheets, yours],
    },
    labels: {
      pause: "Mettre en pause l’animation des outils",
      play: "Relancer l’animation des outils",
    },
    children: (
      <Headline level={2} align="center">
        Vos agents travaillent dans les outils que vous avez déjà
      </Headline>
    ),
  },
} satisfies Meta<typeof ToolHub>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Hub: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(
      canvas.getAllByRole("figure", { name: "Vos outils, reliés à votre agent" })[0],
    ).toBeInTheDocument();
    await expect(canvas.getAllByText("Gmail")[0]).toBeInTheDocument();
    await expect(canvas.getAllByText("Votre agent")[0]).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Mettre en pause l’animation des outils" }),
    ).toBeInTheDocument();
  },
};
