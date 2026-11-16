import { Direction } from "@repo/ui/layout/direction";
import type { Metadata } from "next";

import { PageBody } from "@/features/mecanique/page-body";
import { SiteFooter } from "@/features/mecanique/site-footer";
import { SiteHeader } from "@/features/mecanique/site-header";

export const metadata: Metadata = {
  title: "Mécanique · Une mécanique qui tourne seule",
  description:
    "SHUNPO assemble l’IA, les automatisations et les logiciels sur mesure qui font tourner vos opérations. Vos équipes récupèrent leur temps.",
};

export default function MecaniquePage() {
  return (
    <Direction name="mecanique">
      <SiteHeader />
      <PageBody />
      <SiteFooter />
    </Direction>
  );
}
