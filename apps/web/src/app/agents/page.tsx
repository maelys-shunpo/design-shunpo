import { Direction } from "@repo/ui/layout/direction";
import type { Metadata } from "next";

import { PageBody } from "@/features/agents/page-body";
import { PageFooter } from "@/features/agents/page-footer";
import { PageNav } from "@/features/agents/page-nav";

export const metadata: Metadata = {
  title: "Agents IA sur mesure",
  description:
    "SHUNPO conçoit, connecte et maintient des agents IA et des automatisations sur mesure pour les PME, ETI et grands comptes.",
};

export default function AgentsPage() {
  return (
    <Direction name="agents">
      <PageNav />
      <PageBody />
      <PageFooter />
    </Direction>
  );
}
