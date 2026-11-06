import { MockWindow } from "@repo/ui/agents/mock-window";
import { StatusPill } from "@repo/ui/agents/status-pill";
import { WorkflowNode } from "@repo/ui/agents/workflow-node";
import { siGmail, siOdoo } from "simple-icons";

/* Before: the process as the team runs it today, each step done by hand. */
export function AuditBoard() {
  return (
    <MockWindow
      title="Carte des processus"
      context="Immersion · comptabilité"
      status={<StatusPill tone="waiting">4 étapes manuelles</StatusPill>}
    >
      <ol>
        <WorkflowNode
          kind="Entrée"
          title="Factures reçues par e-mail"
          linked
          status={<StatusPill>Manuel</StatusPill>}
        />
        <WorkflowNode
          kind="Saisie"
          title="Recopie dans le logiciel comptable"
          linked
          status={<StatusPill tone="waiting">Erreurs</StatusPill>}
        />
        <WorkflowNode
          kind="Suivi"
          title="Tableur partagé, mis à jour le soir"
          linked
          status={<StatusPill>Manuel</StatusPill>}
        />
        <WorkflowNode
          kind="Validation"
          title="Relances par téléphone"
          status={<StatusPill tone="waiting">Une seule personne</StatusPill>}
        />
      </ol>
    </MockWindow>
  );
}

/* During: the same process rebuilt, the agent in the middle, a person where it matters. */
export function BuildBoard() {
  return (
    <MockWindow
      title="Flux factures"
      context="Construction · brique 1 en test"
      status={<StatusPill tone="working">En recette</StatusPill>}
    >
      <ol>
        <WorkflowNode
          icon={siGmail}
          kind="Déclencheur"
          title="Nouvelle facture dans la boîte compta"
          linked
        />
        <WorkflowNode
          kind="Agent IA"
          title="Lire, extraire, contrôler"
          agent
          linked
          status={<StatusPill tone="done">Prêt</StatusPill>}
        />
        <WorkflowNode
          kind="Humain"
          title="Valider au-delà de 2 000 €"
          linked
          status={<StatusPill tone="waiting">Règle</StatusPill>}
        />
        <WorkflowNode icon={siOdoo} kind="Action" title="Créer la facture dans Odoo" linked />
        <WorkflowNode kind="Notification" title="Prévenir le canal #compta" />
      </ol>
    </MockWindow>
  );
}

/* After: the team trained, the documentation handed over, the agent in production. */
export function AdoptBoard() {
  return (
    <MockWindow
      title="Suivi du flux"
      context="Évolution · après la mise en service"
      status={<StatusPill tone="done">En production</StatusPill>}
    >
      <ol>
        <WorkflowNode
          kind="Formation"
          title="Claire, Malik et Sonia formés"
          linked
          status={<StatusPill tone="done">Fait</StatusPill>}
        />
        <WorkflowNode
          kind="Documentation"
          title="Guide d’utilisation et règles métier"
          linked
          status={<StatusPill tone="done">Remis</StatusPill>}
        />
        <WorkflowNode
          kind="Suivi"
          title="Revue mensuelle des cas transférés"
          linked
          status={<StatusPill tone="working">Planifiée</StatusPill>}
        />
        <WorkflowNode
          kind="Autonomie"
          title="Vos équipes ajustent les règles"
          agent
          status={<StatusPill tone="done">Ouvert</StatusPill>}
        />
      </ol>
    </MockWindow>
  );
}
