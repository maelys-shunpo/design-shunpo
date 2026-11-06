import { Direction } from "@repo/ui/layout/direction";
import type { Metadata } from "next";

import { PageBody } from "@/features/origami/page-body";
import { SiteFooter } from "@/features/origami/site-footer";
import { SiteHeader } from "@/features/origami/site-header";

export const metadata: Metadata = {
  title: "Origami · Tout logiciel commence par une feuille blanche",
  description:
    "Du besoin au lancement, un logiciel se plie comme un origami : un patron, une base, des modules qui s’emboîtent. SHUNPO conçoit, développe et déploie vos agents IA, automatisations et logiciels sur mesure.",
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
