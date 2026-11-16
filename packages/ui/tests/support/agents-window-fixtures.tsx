import { siGmail } from "simple-icons";

import type { ComposerScenario } from "../../src/agents/composer-plan.tsx";
import { ToolGlimpse } from "../../src/agents/hero-convergence-glimpse.tsx";
import { MockWindow } from "../../src/agents/mock-window.tsx";
import type { OsWindowLabels } from "../../src/agents/os-window.tsx";
import { ReferenceTile } from "../../src/agents/reference-tile.tsx";
import { TaskComposer } from "../../src/agents/task-composer.tsx";
import { ToolTile } from "../../src/agents/tool-tile.tsx";
import { Direction } from "../../src/layout/direction.tsx";

/* The windows and cards of the Agents direction, cut 20 px, as the borders tests render them. */
const scenario: ComposerScenario = {
  id: "factures",
  label: "Saisir les factures",
  keywords: ["factur"],
  request: "Saisir les factures",
  title: "Plan : factures",
  steps: [{ action: "Lire la boîte", tool: "Gmail" }],
  human: "Valider.",
};

export const osLabels: OsWindowLabels = {
  title: "SHUNPO OS",
  context: "Votre entreprise",
  note: "Prototype",
  nav: "Vues du système",
  pending: "à décider",
  decide: "À vous de décider",
  decided: "Fait.",
  journal: "Ce que les agents ont fait",
  ask: {
    label: "Votre question",
    placeholder: "Une question",
    submit: "Demander",
    suggestions: "Questions à essayer",
    you: "Vous",
    agent: "L'agent",
    note: "Prototype.",
  },
};

export function Windows() {
  return (
    <Direction name="agents">
      <MockWindow title="Agent factures">
        <p>Corps</p>
      </MockWindow>
      <TaskComposer
        scenarios={[scenario]}
        fallback={scenario}
        label="Décrivez une tâche"
        placeholder="Une tâche"
        submit="Voir le plan"
        humanLabel="Reste à l’équipe :"
      />
      <ToolTile icon={siGmail} />
      <ReferenceTile name="lemlist" />
      <ToolGlimpse
        id="gmail"
        icon={siGmail}
        app="Gmail"
        context="Boîte"
        title="Facture"
        detail="Reçue"
        fields={[{ label: "Montant", value: "120 €" }]}
        place={{ wide: { x: 0.1, y: 0.1 }, narrow: { x: 0.1, y: 0.1 }, turn: 0, depth: 0 }}
      />
    </Direction>
  );
}
