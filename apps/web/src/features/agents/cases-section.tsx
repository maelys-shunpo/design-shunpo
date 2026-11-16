import { AgentsAction } from "@repo/ui/agents/action";
import { CaseCard } from "@repo/ui/agents/case-card";
import { CaseWall } from "@repo/ui/agents/case-wall";
import { Headline } from "@repo/ui/agents/headline";
import { Section } from "@repo/ui/layout/section";
import Image from "next/image";

import { casesUrl, references } from "../shunpo/content";
import { keyFigureOf } from "../shunpo/figures";
import { logoOf, printOf } from "./cases-prints";

/* The three references the wall shows, each in its own tint; the others are behind « Voir tous les projets ». */
const shown = [
  { id: "tf1", tint: "kurenai" },
  { id: "altaroc", tint: "tenku" },
  { id: "lemlist", tint: "shiro" },
] as const;

function print(id: string) {
  const source = printOf(id);
  return source === undefined ? undefined : (
    <Image src={source} alt="" sizes="(min-width: 48rem) 22rem, 100vw" />
  );
}

function logo(id: string) {
  const mark = logoOf(id);
  return mark === undefined ? undefined : (
    <Image src={mark.image} alt="" width={mark.width} height={mark.height} />
  );
}

/* A gallery at night: the title, three cards on an arc (the delivered product under the client's tint, its logo, its
   key figure, its mission under the pointer), then the way to every project. */
export function CasesSection() {
  const cards = shown.flatMap(({ id, tint }) => {
    const reference = references.find((candidate) => candidate.id === id);
    const keyFigure = keyFigureOf(id);
    if (reference === undefined || keyFigure === undefined) {
      return [];
    }
    return [
      <CaseCard
        key={id}
        href={reference.href}
        client={reference.name}
        logo={logo(id)}
        tint={tint}
        figure={keyFigure.figure}
        unit={keyFigure.unit}
        figureLabel={keyFigure.label}
        mission={reference.mission}
        image={print(id)}
        action="Lire le cas client"
      />,
    ];
  });
  return (
    <Section id="references" spacing="breath" scheme="dark" paper="grain">
      <CaseWall
        label="Projets publiés"
        title={
          <Headline level={2} size="title" align="center" entrance="lines">
            Ce qu’ont gagné nos clients
          </Headline>
        }
        items={cards}
        action={
          <AgentsAction href={casesUrl} variant="outline" size="lg" arrow>
            Voir tous les projets
          </AgentsAction>
        }
      />
    </Section>
  );
}
