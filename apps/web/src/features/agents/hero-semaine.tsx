import { AgentsAction } from "@repo/ui/agents/action";
import { HeroSemaine as WeekGivenBack } from "@repo/ui/agents/hero-semaine";
import { Inline } from "@repo/ui/layout/inline";
import Image from "next/image";

import { contactUrl } from "../shunpo/content";
import { weekTasks } from "./hero-semaine-week";
import stone from "./images/office-stone.webp";

/* Hero proposal « La semaine rendue »: a full week, swept by the agent until only people's time is left. */
export function HeroSemaine() {
  return (
    <WeekGivenBack
      eyebrow="Agents IA sur mesure"
      headline={{
        context: "Vos outils travaillent ensemble.",
        lead: "Vous retrouvez votre",
        before: "semaine.",
        after: "temps.",
      }}
      lead="Les agents reprennent les tâches qui reviennent chaque semaine dans votre messagerie, votre CRM et votre ERP. Vous gardez les rendez-vous et les décisions."
      backdrop={
        <Image
          src={stone}
          alt=""
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 100rem) 100rem, 100vw"
        />
      }
      actions={
        <Inline gap="sm">
          <AgentsAction href={contactUrl} size="lg" variant="signal" arrow>
            Réserver un diagnostic
          </AgentsAction>
        </Inline>
      }
      calendar={{
        title: "Agenda",
        context: "Équipe administrative · semaine du 9 novembre",
        status: "Agent en service",
        days: ["Lun. 9", "Mar. 10", "Mer. 11", "Jeu. 12", "Ven. 13"],
        free: "Libre",
        hours: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
      }}
      tasks={weekTasks}
      journal={{
        title: "Journal de l’agent",
        idle: "Prêt à reprendre vos tâches lundi 09:00",
        approval: {
          initials: "CM",
          text: "Facture Métallerie Rhône-Alpes",
          detail: "4 812,60 € · Claire M.",
          status: "À valider",
        },
      }}
    />
  );
}
