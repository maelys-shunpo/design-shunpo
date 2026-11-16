import type { Metadata } from "next";

import { AgentsPage } from "@/features/agents/agents-page";
import { HeroPliage } from "@/features/agents/hero-pliage";

export const metadata: Metadata = {
  title: "Agents IA sur mesure · hero Pliage",
  description:
    "SHUNPO relie votre messagerie, votre CRM, votre ERP et vos tableurs dans une seule interface où vos agents IA font avancer les tâches.",
};

export default function Page() {
  return <AgentsPage hero={<HeroPliage />} />;
}
