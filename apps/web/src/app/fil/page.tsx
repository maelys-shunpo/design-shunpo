import { FilMotion } from "@repo/ui/fil/fil-motion";
import { Direction } from "@repo/ui/layout/direction";
import type { Metadata } from "next";

import { PageBody } from "@/features/fil/page-body";
import { PageFooter } from "@/features/fil/page-footer";
import { PageHeader } from "@/features/fil/page-header";

export const metadata: Metadata = {
  title: "Le fil",
  description:
    "SHUNPO vous libère du temps : nous relions vos outils, automatisons ce qui se répète et construisons les logiciels qui vous manquent.",
};

export default function FilPage() {
  return (
    <Direction name="fil">
      <FilMotion>
        <PageHeader />
        <PageBody />
        <PageFooter />
      </FilMotion>
    </Direction>
  );
}
