import type { HubMessage } from "@repo/ui/agents/connection-hub";
import {
  siClaude,
  siGmail,
  siGooglesheets,
  siHubspot,
  siMake,
  siMistralai,
  siN8n,
  siNotion,
  siOdoo,
  siShopify,
  siStripe,
  siSupabase,
} from "simple-icons";

/* The tools the agent works in this morning, close to it; logos from simple-icons (CC0). */
export const nearTools = [siGmail, siOdoo, siHubspot, siShopify, siGooglesheets, siNotion];

/* The rest of the stack it plugs into, further out, from tablets up. */
export const farTools = [siN8n, siMake, siClaude, siMistralai, siSupabase, siStripe];

/* What the agent did, one tool after the other. */
export const hubMessages: HubMessage[] = [
  { tool: siGmail.slug, text: "A lu 3 factures fournisseurs" },
  { tool: siOdoo.slug, text: "A préparé 2 brouillons de facture" },
  { tool: siHubspot.slug, text: "A complété la fiche Atelier Brunel" },
  { tool: siShopify.slug, text: "A demandé la relivraison de la commande 10482" },
  { tool: siGooglesheets.slug, text: "A mis à jour le planning des chantiers" },
  { tool: siNotion.slug, text: "A rédigé un compte rendu pour Claire" },
];
