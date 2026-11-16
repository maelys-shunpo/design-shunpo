import type { Meta, StoryObj } from "@storybook/react-vite";
import { siGmail, siHubspot, siQuickbooks, siZendesk } from "simple-icons";
import { expect } from "storybook/test";

import { OsWindow } from "../src/agents/os-window.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/Os",
  component: OsWindow,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "The owner's single screen, a navigable prototype: plain-word views in the sidebar with the count of what waits, figures and the agents' journal behind each, decisions whose approval writes a line into the journal, and a question bar with scripted answers that cite their tools.",
      },
    },
  },
  args: {
    views: [
      {
        area: "today",
        label: "Ce matin",
        brief: "Le week-end, résumé. Deux décisions vous attendent, le reste est fait.",
        figures: [
          { value: "23", label: "tâches faites pendant le week-end" },
          { value: "2", label: "décisions vous attendent" },
          { value: "4", label: "outils tenus à jour" },
        ],
        journal: [
          {
            at: "07:58",
            tool: siGmail,
            text: "A trié la boîte commune : 3 factures, 2 demandes clients",
          },
          { at: "07:45", tool: siQuickbooks, text: "A rapproché 14 paiements du relevé" },
          { at: "07:20", tool: siZendesk, text: "A répondu à 4 suivis de commande" },
        ],
      },
      {
        area: "finance",
        label: "Trésorerie",
        brief: "Le point banque de ce matin, rapproché avec la compta.",
        figures: [
          { value: "86 400 €", label: "en banque ce matin" },
          { value: "12 400 €", label: "attendus cette semaine" },
          { value: "1", label: "facture à payer" },
        ],
        journal: [{ at: "07:40", tool: siQuickbooks, text: "A relancé 2 factures clients échues" }],
      },
      {
        area: "sales",
        label: "Devis",
        brief: "Cinq devis dehors, chacun suivi. La relance la plus urgente attend votre accord.",
        figures: [
          { value: "5", label: "devis en attente de réponse" },
          { value: "46 200 €", label: "de devis en jeu" },
          { value: "9 jours", label: "sans réponse : Batimo" },
        ],
        journal: [{ at: "07:35", tool: siHubspot, text: "A complété la fiche Atelier Brunel" }],
      },
    ],
    decisions: [
      {
        id: "payer",
        area: "finance",
        title: "Payer Métallerie Rhône-Alpes",
        detail: "Facture F-2026-1184 · 4 812,60 € TTC · échéance vendredi",
        reason: "Au-delà de votre seuil de 2 000 €",
        action: "Payer la facture",
        follow: {
          at: "08:05",
          tool: siQuickbooks,
          text: "Paiement F-2026-1184 programmé pour vendredi",
        },
      },
      {
        id: "relancer",
        area: "sales",
        title: "Relancer Batimo",
        detail: "Devis D-2114 · 18 300 € · envoyé il y a 9 jours",
        reason: "Grand compte : la relance part après votre lecture",
        action: "Envoyer la relance",
        follow: { at: "08:06", tool: siGmail, text: "Relance Batimo envoyée" },
      },
    ],
    questions: [
      {
        id: "tresorerie",
        ask: "Où en est la trésorerie ?",
        keywords: ["tresor", "banque", "solde"],
        answer: "86 400 € en banque ce matin. 12 400 € attendus cette semaine.",
        sources: ["QuickBooks", "Google Sheets"],
      },
      {
        id: "devis",
        ask: "Quels devis sont sans réponse ?",
        keywords: ["devis", "relanc"],
        answer: "Cinq devis attendent une réponse, 46 200 € au total.",
        sources: ["HubSpot"],
      },
    ],
    fallback: {
      id: "autre",
      ask: "",
      keywords: [],
      answer: "Ce prototype ne connaît que la trésorerie et les devis.",
      sources: [],
    },
    labels: {
      title: "Votre second cerveau",
      context: "Votre entreprise · lundi 08:04",
      note: "Prototype",
      nav: "Rubriques",
      pending: "à décider",
      decide: "À vous de décider",
      decided: "Fait. La ligne est au journal.",
      journal: "Ce que SHUNPO a fait",
      ask: {
        label: "Votre question",
        placeholder: "Ex. : où en est la trésorerie ?",
        submit: "Demander",
        suggestions: "Questions à essayer",
        you: "Vous",
        agent: "SHUNPO",
        note: "Prototype : réponses scriptées, chiffres fictifs. Le vrai système lit vos outils et cite ses sources.",
      },
    },
  },
} satisfies Meta<typeof OsWindow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Fenetre: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Votre second cerveau")).toBeVisible();
    await expect(canvas.getByRole("tab", { name: /Ce matin/u })).toBeVisible();
  },
};

export const Naviguer: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: /Trésorerie/u }));
    await expect(canvas.getByText("86 400 €")).toBeVisible();
    await expect(canvas.getByText("A relancé 2 factures clients échues")).toBeVisible();
  },
};

export const Decider: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Payer la facture" }));
    await expect(
      await canvas.findByText("Paiement F-2026-1184 programmé pour vendredi", undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
    await expect(canvas.getByText("Fait. La ligne est au journal.")).toBeVisible();
  },
};

export const Demander: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Où en est la trésorerie ?" }));
    await expect(
      await canvas.findByText(/86 400 € en banque ce matin/u, undefined, { timeout: 3000 }),
    ).toBeVisible();
    await expect(canvas.getByText("Google Sheets")).toBeVisible();
  },
};
