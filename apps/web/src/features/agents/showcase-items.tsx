import type { AgentTab } from "@repo/ui/agents/agent-tabs";
import { LiveSurface } from "@repo/ui/agents/live-surface";
import { PhotoStage } from "@repo/ui/agents/photo-stage";
import Image from "next/image";

import office from "./images/office-stone.webp";
import sales from "./images/sales-linen.webp";
import support from "./images/support-plaster.webp";
import { ReportConsole } from "./report-console";
import { SalesConsole } from "./sales-console";
import { SupportConsole } from "./support-console";

const SIZES = "(min-width: 64rem) 60vw, 100vw";

export const showcase: AgentTab[] = [
  {
    id: "support",
    title: "Répondre aux clients",
    description:
      "L’agent répond à partir de vos données, cite ses sources, agit dans votre boutique et transmet à l’équipe ce qui sort de ses règles.",
    panel: (
      <LiveSurface>
        <PhotoStage padding="md" backdrop={<Image src={support} alt="" fill sizes={SIZES} />}>
          <SupportConsole />
        </PhotoStage>
      </LiveSurface>
    ),
  },
  {
    id: "commercial",
    title: "Qualifier et relancer",
    description:
      "Chaque demande entrante est enrichie, rangée dans le CRM et suivie d’un brouillon de relance que votre commercial n’a plus qu’à relire.",
    panel: (
      <LiveSurface>
        <PhotoStage padding="md" backdrop={<Image src={sales} alt="" fill sizes={SIZES} />}>
          <SalesConsole />
        </PhotoStage>
      </LiveSurface>
    ),
  },
  {
    id: "pilotage",
    title: "Piloter sans tableur",
    description:
      "Le lundi matin, l’agent lit les fichiers éparpillés et rédige la synthèse que la direction attendait. Plus de copier-coller le dimanche soir.",
    panel: (
      <LiveSurface>
        <PhotoStage padding="md" backdrop={<Image src={office} alt="" fill sizes={SIZES} />}>
          <ReportConsole />
        </PhotoStage>
      </LiveSurface>
    ),
  },
];
