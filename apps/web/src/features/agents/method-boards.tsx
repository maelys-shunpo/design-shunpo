import { MockWindow } from "@repo/ui/agents/mock-window";
import { StatusPill } from "@repo/ui/agents/status-pill";
import { WorkflowNode } from "@repo/ui/agents/workflow-node";
import { siGmail, siOdoo } from "simple-icons";

/* Immersion: the invoice process as the team runs it today, and the first flow chosen to automate. */
export function AuditBoard() {
  return (
    <MockWindow
      title="Carte du flux"
      context="Immersion · comptabilité fournisseurs"
      status={<StatusPill tone="new">Flux choisi</StatusPill>}
    >
      <ol>
        <WorkflowNode
          kind="Entrée"
          title="Factures par mail"
          linked
          status={<StatusPill>Manuel</StatusPill>}
        />
        <WorkflowNode
          kind="Saisie"
          title="Recopie dans Odoo"
          agent
          linked
          status={<StatusPill tone="waiting">Temps perdu</StatusPill>}
        />
        <WorkflowNode
          kind="Validation"
          title="Accord par téléphone"
          linked
          status={<StatusPill tone="waiting">1 personne</StatusPill>}
        />
        <WorkflowNode
          kind="Suivi"
          title="Mise à jour du tableur"
          status={<StatusPill>Manuel</StatusPill>}
        />
      </ol>
    </MockWindow>
  );
}

/* Construction: the same flow rebuilt brick by brick and tested, the exception and Claire's validation included. */
export function BuildBoard() {
  return (
    <MockWindow
      title="Flux factures"
      context="Construction · brique 1 en test"
      status={<StatusPill tone="working">En recette</StatusPill>}
    >
      <ol>
        <WorkflowNode icon={siGmail} kind="Déclencheur" title="Facture reçue par mail" linked />
        <WorkflowNode
          kind="Agent IA"
          title="Lire et contrôler"
          agent
          linked
          status={<StatusPill tone="done">Prêt</StatusPill>}
        />
        <WorkflowNode icon={siOdoo} kind="Brouillon Odoo" title="Préparé par l’agent" linked />
        <WorkflowNode
          kind="Validation"
          title="Claire valide"
          linked
          status={<StatusPill tone="waiting">Au-delà de 2 000 €</StatusPill>}
        />
        <WorkflowNode icon={siOdoo} kind="Enregistrement" title="Comptabiliser dans Odoo" />
      </ol>
    </MockWindow>
  );
}

/* Évolution: the flow in service, adjusted with the team and extended by a new brick. */
export function AdoptBoard() {
  return (
    <MockWindow
      title="Flux factures"
      context="Évolution · en service"
      status={<StatusPill tone="done">En production</StatusPill>}
    >
      <ol>
        <WorkflowNode
          kind="Réglage"
          title="Seuil de validation revu"
          linked
          status={<StatusPill tone="done">Appliqué</StatusPill>}
        />
        <WorkflowNode
          kind="Connexions"
          title="Gmail et Odoo suivis"
          linked
          status={<StatusPill tone="done">Stables</StatusPill>}
        />
        <WorkflowNode
          kind="Revue"
          title="Exceptions de Claire"
          linked
          status={<StatusPill tone="working">Chaque mois</StatusPill>}
        />
        <WorkflowNode
          kind="Nouvelle brique"
          title="Relance fournisseurs"
          agent
          status={<StatusPill tone="new">En cours</StatusPill>}
        />
      </ol>
    </MockWindow>
  );
}
