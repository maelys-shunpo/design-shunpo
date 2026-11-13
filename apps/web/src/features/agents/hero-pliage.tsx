import { HeroPliage as Scene, type PliageTool } from "@repo/ui/agents/hero-pliage";
import { Section } from "@repo/ui/layout/section";
import { siGmail, siGooglesheets, siHubspot, siOdoo } from "simple-icons";

import { PliageCopy } from "./hero-pliage-copy";

/* One sheet per family of tools, clockwise from the top branch of the star. */
const tools: PliageTool[] = [
  { id: "messagerie", label: "Messagerie", icon: siGmail, paper: "white" },
  { id: "crm", label: "CRM", icon: siHubspot, paper: "shiro" },
  { id: "erp", label: "ERP", icon: siOdoo, paper: "frost" },
  { id: "tableur", label: "Tableur", icon: siGooglesheets, paper: "tenku" },
];

/* Hero proposal « Pliage »: four sheets, one per tool, fold into the SHUNPO sign as the page scrolls. */
export function HeroPliage() {
  return (
    <Section spacing="flush">
      <Scene
        copy={<PliageCopy />}
        tools={tools}
        label="Quatre feuilles de papier, une par outil (messagerie, CRM, ERP, tableur), pliées et emboîtées en un seul signe, le shuriken SHUNPO : 1 système."
        caption={{ before: "4 outils", after: "1 système" }}
      />
    </Section>
  );
}
