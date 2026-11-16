import type { Metadata } from "next";

import { AgentsPage } from "@/features/agents/agents-page";
import { HeroSection } from "@/features/agents/hero-section";

export const metadata: Metadata = {
  title: "Agents IA sur mesure",
  description:
    "SHUNPO conçoit, connecte et maintient des agents IA et des automatisations sur mesure pour les PME, ETI et grands comptes.",
};

export default function Page() {
  return <AgentsPage hero={<HeroSection />} opening="film" />;
}
