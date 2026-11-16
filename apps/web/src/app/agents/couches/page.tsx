import type { Metadata } from "next";

import { AgentsPage } from "@/features/agents/agents-page";
import { HeroCouches } from "@/features/agents/hero-couches";

export const metadata: Metadata = {
  title: "Agents IA sur mesure · hero « Vue éclatée »",
  description:
    "SHUNPO conçoit une interface reliée à vos outils : vos agents IA y travaillent, vous validez ce qui compte.",
};

export default function Page() {
  return <AgentsPage hero={<HeroCouches />} />;
}
