import type { Metadata } from "next";

import { AgentsPage } from "@/features/agents/agents-page";
import { HeroShuriken } from "@/features/agents/hero-shuriken";

export const metadata: Metadata = {
  title: "Agents IA sur mesure · hero Le signe plié",
  description:
    "SHUNPO relie votre messagerie, votre CRM, votre ERP et vos tableurs à une seule interface où vos agents IA font avancer les tâches.",
};

export default function Page() {
  return <AgentsPage hero={<HeroShuriken />} />;
}
