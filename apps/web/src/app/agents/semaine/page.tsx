import type { Metadata } from "next";

import { AgentsPage } from "@/features/agents/agents-page";
import { HeroSemaine } from "@/features/agents/hero-semaine";

export const metadata: Metadata = {
  title: "Agents IA sur mesure · La semaine rendue",
  description:
    "Les agents SHUNPO reprennent les tâches qui reviennent chaque semaine dans vos outils. Vous gardez les rendez-vous et les décisions.",
};

export default function Page() {
  return <AgentsPage hero={<HeroSemaine />} />;
}
