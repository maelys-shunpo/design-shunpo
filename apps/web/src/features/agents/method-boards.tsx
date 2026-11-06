import { MockWindow } from "@repo/ui/agents/mock-window";
import { StatusPill } from "@repo/ui/agents/status-pill";
import { WorkflowNode } from "@repo/ui/agents/workflow-node";
import { siGmail, siOdoo } from "simple-icons";

/* Immersion: the invoice process as the team runs it today, and the first flow chosen to automate. */
export function AuditBoard() {
  return (
    <MockWindow
      title="Carte des processus"
      context="Immersion · comptabilité fournisseurs"
      status={<StatusPill tone="new">Premier flux choisi</StatusPill>}
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
          title="Recopie dans Odoo, ligne par ligne"
          agent
          linked
          status={<StatusPill tone="waiting">Temps perdu</StatusPill>}
        />
        <WorkflowNode
          kind="Validation"
          title="Accord du responsable par téléphone"
          linked
          status={<StatusPill tone="waiting">Une seule personne</StatusPill>}
        />
        <WorkflowNode
          kind="Suivi"
          title="Tableur partagé, mis à jour le soir"
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
        <WorkflowNode
          kind="Exception"
          title="Fournisseur inconnu : transmis à Claire"
          linked
          status={<StatusPill tone="done">Testé</StatusPill>}
        />
        <WorkflowNode icon={siOdoo} kind="Action" title="Créer la facture dans Odoo" />
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
          title="Seuil de validation revu avec l’équipe"
          linked
          status={<StatusPill tone="done">Appliqué</StatusPill>}
        />
        <WorkflowNode
          kind="Connexions"
          title="Messagerie et Odoo surveillés"
          linked
          status={<StatusPill tone="done">Stables</StatusPill>}
        />
        <WorkflowNode
          kind="Revue"
          title="Cas transmis à Claire, revus chaque mois"
          linked
          status={<StatusPill tone="working">Planifiée</StatusPill>}
        />
        <WorkflowNode
          kind="Nouvelle brique"
          title="Relances des fournisseurs en retard"
          agent
          status={<StatusPill tone="new">En construction</StatusPill>}
        />
      </ol>
    </MockWindow>
  );
}
