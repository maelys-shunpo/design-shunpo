import type { Metadata } from "next";

import { AgentsPage } from "@/features/agents/agents-page";
import { HeroConvergence } from "@/features/agents/hero-convergence";

export const metadata: Metadata = {
  title: "Agents IA sur mesure · hero Convergence",
  description:
    "SHUNPO réunit votre messagerie, votre CRM et votre ERP dans une seule interface où vos agents IA font avancer les tâches.",
};

export default function Page() {
  return <AgentsPage hero={<HeroConvergence />} />;
}
