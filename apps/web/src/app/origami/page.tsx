import { Direction } from "@repo/ui/layout/direction";
import type { Metadata } from "next";

import { PageBody } from "@/features/origami/page-body";
import { SiteFooter } from "@/features/origami/site-footer";
import { SiteHeader } from "@/features/origami/site-header";

export const metadata: Metadata = {
  title: "Origami · Pliez le travail, dépliez le temps",
  description:
    "Agents IA, automatisations et logiciels sur mesure : SHUNPO plie ce qui vous prend des heures en systèmes qui tournent seuls.",
};

export default function OrigamiPage() {
  return (
    <Direction name="origami">
      <SiteHeader />
      <PageBody />
      <SiteFooter />
    </Direction>
  );
}
