import { Direction } from "@repo/ui/layout/direction";
import type { Metadata } from "next";

import { Proof } from "@/features/instant/proof";
import { SiteFooter } from "@/features/instant/site-footer";
import { SiteHeader } from "@/features/instant/site-header";
import { Story } from "@/features/instant/story";

export const metadata: Metadata = {
  title: "Instant",
  description:
    "SHUNPO vous libère du temps : automatisations, agents IA et logiciels sur mesure qui retirent de vos journées tout ce qui se répète. Agence à Lyon.",
};

export default function InstantPage() {
  return (
    <Direction name="instant">
      <SiteHeader />
      <main>
        <Story />
        <Proof />
      </main>
      <SiteFooter />
    </Direction>
  );
}
