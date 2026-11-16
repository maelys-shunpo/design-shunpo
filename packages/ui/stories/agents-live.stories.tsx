import type { Meta, StoryObj } from "@storybook/react-vite";
import { siGmail, siOdoo } from "simple-icons";
import { expect } from "storybook/test";

import { LiveSurface } from "../src/agents/live-surface.tsx";
import { PhotoStage } from "../src/agents/photo-stage.tsx";
import { StatusPill } from "../src/agents/status-pill.tsx";
import { SyncEvent } from "../src/agents/sync-event.tsx";
import { ToastNote } from "../src/agents/toast-note.tsx";
import { WorkflowNode } from "../src/agents/workflow-node.tsx";
import { inAgents, PLATE } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/LiveSurface",
  component: LiveSurface,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "LiveSurface replays an interface written in its final state: its `data-live` pieces enter in order, then the loop holds and starts again, paused off screen, under the pointer and focus, and never under reduced motion. PhotoStage lays it on a photographed surface, with a floating ToastNote. Marquee drifts a row or a column of items (ToolColumns of ToolTile). SyncEvent and WorkflowNode draw activity and workflows.",
      },
    },
  },
  args: { children: null },
} satisfies Meta<typeof LiveSurface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OnASurface: Story = {
  render: () => (
    <LiveSurface hold={1}>
      <PhotoStage
        padding="md"
        backdrop={<img src={PLATE} alt="" />}
        floating={
          <ToastNote app="Canal #compta" time="09:44" message="Facture enregistrée." live={3} />
        }
      >
        <ul>
          <SyncEvent
            icon={siGmail}
            tool="Gmail"
            event="3 factures reçues"
            time="09:41"
            live={1}
            status={<StatusPill tone="done">Lu</StatusPill>}
          />
          <SyncEvent
            icon={siOdoo}
            tool="Odoo"
            event="2 factures créées"
            time="09:42"
            live={2}
            status={<StatusPill tone="done">Écrit</StatusPill>}
          />
        </ul>
        <ol>
          <WorkflowNode icon={siGmail} kind="Déclencheur" title="Nouvelle facture" linked />
          <WorkflowNode
            kind="Agent IA"
            title="Lire et extraire"
            agent
            linked
            status={<StatusPill tone="done">Prêt</StatusPill>}
          />
          <WorkflowNode kind="Action" title="Écrire" />
        </ol>
      </PhotoStage>
    </LiveSurface>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("3 factures reçues")).toBeInTheDocument();
  },
};
