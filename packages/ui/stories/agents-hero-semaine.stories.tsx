import type { Meta, StoryObj } from "@storybook/react-vite";
import { siGmail, siGooglesheets, siHubspot, siOdoo } from "simple-icons";
import { expect } from "storybook/test";

import { HeroSemaine } from "../src/agents/hero-semaine.tsx";
import { inAgents, PLATE } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/Hero semaine",
  component: HeroSemaine,
  decorators: [inAgents],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Hero « La semaine rendue »: the promise above a full working week. Held over three screens from tablets up, the agent's ink cursor sweeps the week on a sunlit wall whose light drifts from Monday to Friday at the pace of the scroll; each routine it meets is ticked, a band of its colour flies into the agent's journal and its slot shows as free time, until only people's time is left, an approval waits on a person and the headline's last word turns from « semaine » to « temps ». Phones and reduced motion read the week ticked, its slots free, the journal complete.",
      },
    },
  },
  args: {
    eyebrow: "Agents IA sur mesure",
    headline: {
      context: "Vos outils travaillent ensemble.",
      lead: "Vous retrouvez votre",
      before: "semaine.",
      after: "temps.",
    },
    lead: "Les agents reprennent les tâches qui reviennent chaque semaine dans vos outils. Vous gardez les rendez-vous et les décisions.",
    actions: <a href="#contact">Réserver un diagnostic</a>,
    backdrop: <img src={PLATE} alt="" />,
    calendar: {
      title: "Agenda",
      context: "Équipe administrative · semaine du 9 novembre",
      status: "Agent en service",
      days: ["Lun. 9", "Mar. 10", "Mer. 11", "Jeu. 12", "Ven. 13"],
      free: "Libre",
      hours: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
    },
    tasks: [
      {
        id: "lun-factures",
        day: 0,
        start: 0,
        end: 3,
        title: "Ressaisir les factures",
        routine: { tool: siOdoo, done: "Factures ressaisies dans Odoo", at: "lun. 09:12" },
      },
      {
        id: "lun-devis",
        day: 0,
        start: 4,
        end: 6,
        title: "Relancer les devis",
        routine: { tool: siHubspot, done: "Devis relancés dans HubSpot", at: "lun. 11:04" },
      },
      {
        id: "mar-client",
        day: 1,
        start: 3,
        end: 6,
        title: "Rendez-vous client",
        note: "Métallerie Rhône-Alpes",
      },
      {
        id: "mer-support",
        day: 2,
        start: 5,
        end: 7,
        title: "Trier la boîte support",
        routine: { tool: siGmail, done: "Boîte support triée", at: "mer. 11:31" },
      },
      {
        id: "jeu-chantier",
        day: 3,
        start: 9,
        end: 13,
        title: "Point chantier",
        note: "Villeurbanne",
      },
      {
        id: "ven-reporting",
        day: 4,
        start: 0,
        end: 3,
        title: "Mettre à jour le reporting",
        routine: { tool: siGooglesheets, done: "Reporting mis à jour", at: "ven. 09:01" },
      },
    ],
    journal: {
      title: "Journal de l’agent",
      idle: "Prêt à reprendre vos tâches lundi 09:00",
      approval: {
        initials: "CM",
        text: "Facture Métallerie Rhône-Alpes",
        detail: "4 812,60 € · Claire M.",
        status: "À valider",
      },
    },
  },
} satisfies Meta<typeof HeroSemaine>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Week: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      "Vos outils travaillent ensemble. Vous retrouvez votre temps.",
    );
    await expect(canvas.getByText("Rendez-vous client")).toBeVisible();
    await expect(canvas.getByText("Journal de l’agent")).toBeVisible();
  },
};
